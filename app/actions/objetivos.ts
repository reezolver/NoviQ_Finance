'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import {
  calcularPropagacaoObjetivo,
  nomeCategoriaEspelho,
} from '@/lib/objetivo-planejado'
import type { Database } from '@/types/database'

// ─── Schemas (sem `any`) ──────────────────────────────────────────────────────

const dataSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD).')
const valorPositivo = z
  .number({ error: 'Informe um valor.' })
  .positive('O valor deve ser maior que zero.')
const valorNaoNegativo = z
  .number({ error: 'Informe um valor.' })
  .min(0, 'O valor não pode ser negativo.')
const nomeSchema = z
  .string()
  .trim()
  .min(1, 'Informe o nome do objetivo.')
  .max(120, 'Nome muito longo.')

const criarObjetivoSchema = z.object({
  nome: nomeSchema,
  valorAlvo: valorPositivo,
  dataLimite: dataSchema,
  valorInicial: valorNaoNegativo.optional(),
})

/** Payload aceito por {@link criarObjetivo}. */
export type CriarObjetivoInput = z.infer<typeof criarObjetivoSchema>

const editarObjetivoSchema = z.object({
  nome: nomeSchema.optional(),
  valorAlvo: valorPositivo.optional(),
  dataLimite: dataSchema.optional(),
  valorInicial: valorNaoNegativo.optional(),
})

/** Payload aceito por {@link editarObjetivo} (campos parciais). */
export type EditarObjetivoInput = z.infer<typeof editarObjetivoSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Confirma que a subconta existe **e é acessível** pelo usuário atual. A query
 * roda no client de usuário (RLS-enforced): se a RLS negar, nada volta. Defesa
 * em profundidade — a RLS continua sendo a rede final.
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

/** Revalida a tela de objetivos + as telas que listam objetivos no select. */
function revalidarTelasObjetivos(): void {
  revalidatePath('/[subcontaId]/objetivos', 'page')
  revalidatePath('/[subcontaId]/mensal/[ano]/[mes]', 'page')
}

/**
 * Garante a **categoria-espelho** do objetivo e devolve o id dela (Spec 36 · Q2
 * opção A).
 *
 * Grupo `investimento`: é onde o aporte de objetivo passou a poder ser lançado
 * (Spec 35 · §3.3), então planejado e realizado caem no **mesmo** grupo — sem
 * isso o 50‑30‑20 compararia baldes diferentes.
 *
 * A categoria é marcada por `objetivo_id`, o que a esconde da aba Categorias e
 * do select de lançamento (R12).
 */
async function garantirCategoriaEspelho(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  subcontaId: string,
  objetivoId: string,
  nomeObjetivo: string
): Promise<string> {
  const { data: existente } = await supabase
    .from('categorias')
    .select('id')
    .eq('subconta_id', subcontaId)
    .eq('objetivo_id', objetivoId)
    .maybeSingle()

  const nome = nomeCategoriaEspelho(nomeObjetivo)

  if (existente) {
    // Renomear o objetivo renomeia o espelho, senão o bloco mostra o nome velho.
    await supabase.from('categorias').update({ nome }).eq('id', existente.id)
    return existente.id
  }

  const { data: criada, error } = await supabase
    .from('categorias')
    .insert({
      subconta_id: subcontaId,
      nome,
      grupo: 'investimento',
      objetivo_id: objetivoId,
      is_default: false,
    })
    .select('id')
    .single()

  if (error || !criada) {
    throw new Error(
      `Erro ao preparar o planejado do objetivo: ${error?.message ?? 'desconhecido'}`
    )
  }
  return criada.id
}

/**
 * Sincroniza o **Planejado** do objetivo (RF‑13).
 *
 * Roda ao criar e ao editar. O valor mensal vem de `calcularNecessarioMensal`
 * sobre o que **falta** poupar (alvo − acumulado), distribuído nos meses até a
 * data limite.
 *
 * ⚠️ **Nunca toca em linha `origem='manual'` (R4).** O educador que baixou um
 * mês para R$ 700 mantém os R$ 700, mesmo que o objetivo mude de valor depois.
 * As linhas geradas aqui (`origem='objetivo'`) são apagadas e reescritas, o que
 * mantém a sugestão sempre coerente com o objetivo atual.
 */
async function sincronizarPlanejadoObjetivo(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  subcontaId: string,
  objetivoId: string
): Promise<void> {
  const { data: objetivo } = await supabase
    .from('objetivos')
    .select('id, nome, valor_alvo, data_limite, valor_inicial')
    .eq('id', objetivoId)
    .eq('subconta_id', subcontaId)
    .maybeSingle()
  if (!objetivo) return

  const categoriaId = await garantirCategoriaEspelho(
    supabase,
    subcontaId,
    objetivoId,
    objetivo.nome
  )

  // Acumulado = valor inicial + aportes já lançados para este objetivo.
  const { data: aportes } = await supabase
    .from('lancamentos')
    .select('valor')
    .eq('subconta_id', subcontaId)
    .eq('objetivo_id', objetivoId)
  const acumulado =
    Number(objetivo.valor_inicial ?? 0) +
    (aportes ?? []).reduce((s, a) => s + Number(a.valor), 0)

  // Meses que o educador ajustou à mão — intocáveis.
  const { data: manuais } = await supabase
    .from('orcamentos')
    .select('ano, mes')
    .eq('subconta_id', subcontaId)
    .eq('categoria_id', categoriaId)
    .eq('origem', 'manual')
    .not('ano', 'is', null)

  const meses = calcularPropagacaoObjetivo({
    valorAlvo: Number(objetivo.valor_alvo),
    valorAcumulado: acumulado,
    dataLimite: objetivo.data_limite,
    overridesExistentes: (manuais ?? []).map((m) => ({
      ano: Number(m.ano),
      mes: Number(m.mes),
    })),
  })

  // Limpa só o que a propagação escreveu antes (mantém os manuais).
  await supabase
    .from('orcamentos')
    .delete()
    .eq('subconta_id', subcontaId)
    .eq('categoria_id', categoriaId)
    .eq('origem', 'objetivo')

  if (meses.length === 0) return

  const { error } = await supabase.from('orcamentos').insert(
    meses.map((m) => ({
      subconta_id: subcontaId,
      categoria_id: categoriaId,
      valor_planejado: Number(m.valor.toFixed(2)),
      ano: m.ano,
      mes: m.mes,
      origem: 'objetivo' as const,
    }))
  )
  if (error) {
    throw new Error(`Erro ao propagar o planejado do objetivo: ${error.message}`)
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Cria um objetivo (meta) na subconta.
 *
 * - Valida tudo com `zod` e **revalida o acesso à subconta no servidor**.
 * - O acumulado **não** é persistido: é derivado em runtime
 *   (`valor_inicial + Σ lançamentos do tipo objetivo`) — ver a page.
 */
export async function criarObjetivo(
  subcontaId: string,
  dados: CriarObjetivoInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const dadosValidados = criarObjetivoSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { data: criado, error } = await supabase
    .from('objetivos')
    .insert({
      subconta_id: id,
      nome: dadosValidados.nome,
      valor_alvo: dadosValidados.valorAlvo,
      data_limite: dadosValidados.dataLimite,
      valor_inicial: dadosValidados.valorInicial ?? 0,
    })
    .select('id')
    .single()
  if (error || !criado) {
    throw new Error(`Erro ao criar objetivo: ${error?.message ?? 'desconhecido'}`)
  }

  // RF-13: o valor mensal necessario ja entra no Planejado dos meses ate o prazo.
  await sincronizarPlanejadoObjetivo(supabase, id, criado.id)

  revalidarTelasObjetivos()
  return { ok: true }
}

/**
 * Edita campos de um objetivo existente. A RLS de `objetivos` garante que só
 * quem acessa a subconta consegue atualizar; validamos o acesso aqui também.
 */
export async function editarObjetivo(
  subcontaId: string,
  objetivoId: string,
  dados: EditarObjetivoInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const objId = z.string().uuid('Objetivo inválido.').parse(objetivoId)
  const dadosValidados = editarObjetivoSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const patch: Database['public']['Tables']['objetivos']['Update'] = {}
  if (dadosValidados.nome !== undefined) patch.nome = dadosValidados.nome
  if (dadosValidados.valorAlvo !== undefined) patch.valor_alvo = dadosValidados.valorAlvo
  if (dadosValidados.dataLimite !== undefined) patch.data_limite = dadosValidados.dataLimite
  if (dadosValidados.valorInicial !== undefined) patch.valor_inicial = dadosValidados.valorInicial

  const { error } = await supabase
    .from('objetivos')
    .update(patch)
    .eq('id', objId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao editar objetivo: ${error.message}`)
  }

  // Repropaga com os dados novos. Meses ajustados a mao ficam intactos (R4).
  await sincronizarPlanejadoObjetivo(supabase, id, objId)

  revalidarTelasObjetivos()
  return { ok: true }
}

/**
 * Remove um objetivo da subconta. RLS protege; validamos o acesso também.
 * Lançamentos vinculados mantêm `objetivo_id` conforme a FK (sem cascade no MVP).
 */
export async function removerObjetivo(
  subcontaId: string,
  objetivoId: string
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const objId = z.string().uuid('Objetivo inválido.').parse(objetivoId)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase
    .from('objetivos')
    .delete()
    .eq('id', objId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao remover objetivo: ${error.message}`)
  }

  revalidarTelasObjetivos()
  return { ok: true }
}
