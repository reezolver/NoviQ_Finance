'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { resolverMesFatura } from '@/lib/cartao'
import type { Database } from '@/types/database'

type GrupoCategoria = Database['public']['Enums']['grupo_categoria']

/** Grupos válidos para uma **despesa**. Receita → grupo `renda` (decisão #2). */
const GRUPOS_DESPESA: ReadonlyArray<GrupoCategoria> = ['fixa', 'variavel', 'investimento']

// ─── Schemas (sem `any`; 3 tipos via discriminated union) ────────────────────────

const dataSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD).')
const valorSchema = z
  .number({ error: 'Informe um valor.' })
  .positive('O valor deve ser maior que zero.')
const textoOpcional = z.string().trim().max(500).optional()

const lancamentoSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('despesa'),
    // Spec 38: o cartao e MEIO DE PAGAMENTO. A despesa continua indo para a
    // categoria escolhida (R19.6) — o cartao so muda EM QUE MES ela aparece.
    cartaoId: z.string().uuid('Cartão inválido.').nullable().optional(),
    valor: valorSchema,
    categoriaId: z.string().uuid('Categoria inválida.'),
    data: dataSchema,
    descricao: textoOpcional,
    observacao: textoOpcional,
  }),
  z.object({
    tipo: z.literal('receita'),
    valor: valorSchema,
    categoriaId: z.string().uuid('Categoria inválida.'),
    data: dataSchema,
    descricao: textoOpcional,
    observacao: textoOpcional,
  }),
  z.object({
    tipo: z.literal('objetivo'),
    valor: valorSchema,
    objetivoId: z.string().uuid('Objetivo inválido.'),
    // Objetivo não tem categoria (Spec 05) → ganha grupo próprio fixa|variavel
    // (Spec 24, RF-2), para o aporte contabilizar no bloco/saldo certos.
    // Spec 35 §3.3: com o 4º bloco, o aporte tambem pode ir para investimento.
    grupo: z.enum(['fixa', 'variavel', 'investimento'], {
      error: 'Classifique como Fixa, Variável ou Investimento.',
    }),
    categoriaId: z.string().uuid().nullable().optional(),
    data: dataSchema,
    descricao: textoOpcional,
    observacao: textoOpcional,
  }),
])

/** Payload aceito por {@link criarLancamento}. */
export type CriarLancamentoInput = z.infer<typeof lancamentoSchema>

const editarLancamentoSchema = z.object({
  valor: valorSchema.optional(),
  categoriaId: z.string().uuid().nullable().optional(),
  objetivoId: z.string().uuid().nullable().optional(),
  // Só faz sentido sem categoria (aporte); a constraint do banco é a barreira final.
  grupo: z.enum(['fixa', 'variavel', 'investimento']).nullable().optional(),
  data: dataSchema.optional(),
  descricao: textoOpcional,
  observacao: textoOpcional,
})

/** Payload aceito por {@link editarLancamento} (campos parciais). */
export type EditarLancamentoInput = z.infer<typeof editarLancamentoSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Confirma que a subconta existe **e é acessível** pelo usuário atual. A query
 * roda no client de usuário (RLS-enforced): se a RLS negar, nada volta. É a
 * checagem de aplicação (defesa em profundidade) exigida pela spec §4 —
 * a RLS continua sendo a rede final.
 */
async function assertAcessoSubconta(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  subcontaId: string
): Promise<void> {
  const { data } = await supabase
    .from('subcontas')
    .select('id')
    .eq('id', subcontaId)
    .maybeSingle()
  if (!data) {
    throw new Error('Subconta não encontrada ou sem acesso.')
  }
}

/** Revalida as telas que dependem dos lançamentos (mensal + anual). */
function revalidarTelasFinanceiras(): void {
  revalidatePath('/[subcontaId]/mensal/[ano]/[mes]', 'page')
  revalidatePath('/[subcontaId]/controle-anual', 'page')
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Cria um lançamento (despesa / receita / objetivo) na subconta.
 *
 * - Valida tudo com `zod` e **revalida o acesso à subconta no servidor**.
 * - Garante coerência categoria × tipo: receita → grupo `renda`; despesa →
 *   `fixa`/`variavel`/`investimento`. Objetivo grava `objetivo_id` (categoria
 *   opcional/nula).
 * - `created_by_user_id` é preenchido pelo default da coluna (`auth.uid()`).
 * - **Sem** campo de cartão/conta (decisão #2).
 */
export async function criarLancamento(
  subcontaId: string,
  dados: CriarLancamentoInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const dadosValidados = lancamentoSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  let categoriaId: string | null = null
  let objetivoId: string | null = null
  // Grupo só é preenchido para o aporte de objetivo (sem categoria). Despesa/
  // receita derivam o grupo da categoria → coluna fica nula (Spec 24).
  let grupo: Extract<GrupoCategoria, 'fixa' | 'variavel' | 'investimento'> | null = null

  if (dadosValidados.tipo === 'objetivo') {
    const { data: objetivo } = await supabase
      .from('objetivos')
      .select('id')
      .eq('id', dadosValidados.objetivoId)
      .eq('subconta_id', id)
      .maybeSingle()
    if (!objetivo) {
      throw new Error('Objetivo inválido para esta subconta.')
    }
    objetivoId = dadosValidados.objetivoId
    categoriaId = dadosValidados.categoriaId ?? null
    grupo = dadosValidados.grupo
  } else {
    const { data: categoria } = await supabase
      .from('categorias')
      .select('id, grupo')
      .eq('id', dadosValidados.categoriaId)
      .eq('subconta_id', id)
      .maybeSingle()
    if (!categoria) {
      throw new Error('Categoria inválida para esta subconta.')
    }
    const grupo = categoria.grupo as GrupoCategoria
    const coerente =
      dadosValidados.tipo === 'receita'
        ? grupo === 'renda'
        : GRUPOS_DESPESA.includes(grupo)
    if (!coerente) {
      throw new Error('Categoria incompatível com o tipo do lançamento.')
    }
    categoriaId = dadosValidados.categoriaId
  }

  // Spec 38 R19: compra no cartao NAO aparece no mes da compra, e sim no mes da
  // fatura. Resolvemos aqui e PERSISTIMOS (R19.4/R19.5): `data` continua sendo a
  // data da compra, e mudar o cartao depois nao remaneja o historico.
  const cartaoId =
    dadosValidados.tipo === 'despesa' ? dadosValidados.cartaoId ?? null : null
  let anoFatura: number | null = null
  let mesFatura: number | null = null

  if (cartaoId) {
    const { data: cartao } = await supabase
      .from('cartoes')
      .select('dia_fechamento, dia_vencimento')
      .eq('id', cartaoId)
      .eq('subconta_id', id)
      .is('deleted_at', null)
      .maybeSingle()
    if (!cartao) {
      throw new Error('Cartão não encontrado nesta conta.')
    }
    const fatura = resolverMesFatura(
      dadosValidados.data,
      cartao.dia_fechamento,
      cartao.dia_vencimento
    )
    anoFatura = fatura.ano
    mesFatura = fatura.mes
  }

  const { error } = await supabase.from('lancamentos').insert({
    subconta_id: id,
    tipo: dadosValidados.tipo,
    valor: dadosValidados.valor,
    data: dadosValidados.data,
    categoria_id: categoriaId,
    objetivo_id: objetivoId,
    grupo,
    cartao_id: cartaoId,
    ano_fatura: anoFatura,
    mes_fatura: mesFatura,
    descricao: dadosValidados.descricao || null,
    observacao: dadosValidados.observacao || null,
  })
  if (error) {
    throw new Error(`Erro ao criar lançamento: ${error.message}`)
  }

  revalidarTelasFinanceiras()
  return { ok: true }
}

/**
 * Edita campos de um lançamento existente. A RLS de `lancamentos` garante que
 * só quem acessa a subconta consegue atualizar; validamos o acesso aqui também.
 */
export async function editarLancamento(
  subcontaId: string,
  lancamentoId: string,
  dados: EditarLancamentoInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const lancId = z.string().uuid('Lançamento inválido.').parse(lancamentoId)
  const dadosValidados = editarLancamentoSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const patch: Database['public']['Tables']['lancamentos']['Update'] = {}
  if (dadosValidados.valor !== undefined) patch.valor = dadosValidados.valor
  if (dadosValidados.categoriaId !== undefined) patch.categoria_id = dadosValidados.categoriaId
  if (dadosValidados.objetivoId !== undefined) patch.objetivo_id = dadosValidados.objetivoId
  if (dadosValidados.grupo !== undefined) patch.grupo = dadosValidados.grupo
  if (dadosValidados.data !== undefined) patch.data = dadosValidados.data
  if (dadosValidados.descricao !== undefined) patch.descricao = dadosValidados.descricao || null
  if (dadosValidados.observacao !== undefined) patch.observacao = dadosValidados.observacao || null

  const { error } = await supabase
    .from('lancamentos')
    .update(patch)
    .eq('id', lancId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao editar lançamento: ${error.message}`)
  }

  revalidarTelasFinanceiras()
  return { ok: true }
}

/**
 * Remove um lançamento da subconta. RLS protege; validamos o acesso também.
 *
 * **Soft delete** (Spec 37 · PRD Q5): grava `deleted_at` em vez de apagar a
 * linha. Coerente com o pool/lixeira da Spec 21 — dado financeiro apagado por
 * engano precisa ser recuperável, ainda mais com a lixeira a um toque no
 * celular. Todas as leituras filtram `deleted_at is null`.
 */
export async function removerLancamento(
  subcontaId: string,
  lancamentoId: string
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const lancId = z.string().uuid('Lançamento inválido.').parse(lancamentoId)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase
    .from('lancamentos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', lancId)
    .eq('subconta_id', id)
    // Não "re-excluir" algo já excluído (idempotente).
    .is('deleted_at', null)
  if (error) {
    throw new Error(`Erro ao remover lançamento: ${error.message}`)
  }

  revalidarTelasFinanceiras()
  return { ok: true }
}
