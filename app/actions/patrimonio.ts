'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

// ─── Schemas (sem `any`) ──────────────────────────────────────────────────────

const valorNaoNegativo = z
  .number({ error: 'Informe um valor.' })
  .min(0, 'O valor não pode ser negativo.')
const descricaoSchema = z
  .string()
  .trim()
  .max(160, 'Descrição muito longa.')
  .optional()

const tipoPatrimonioSchema = z.enum(['imovel', 'veiculo', 'investimento'], {
  error: 'Tipo inválido.',
})
const categoriaInvestimentoSchema = z.enum(
  ['renda_fixa', 'renda_variavel', 'multimercado'],
  { error: 'Categoria inválida.' }
)
const finalidadeSchema = z.enum(['reserva', 'patrimonio'], {
  error: 'Finalidade inválida.',
})

const criarPatrimonioSchema = z.object({
  tipo: tipoPatrimonioSchema,
  descricao: descricaoSchema,
  valor: valorNaoNegativo,
  rentabilidade: valorNaoNegativo.optional(),
  categoriaInvestimento: categoriaInvestimentoSchema.nullish(),
  finalidade: finalidadeSchema.nullish(),
})

/** Payload aceito por {@link criarPatrimonio}. */
export type CriarPatrimonioInput = z.infer<typeof criarPatrimonioSchema>

const editarPatrimonioSchema = criarPatrimonioSchema.partial()

/** Payload aceito por {@link editarPatrimonio} (campos parciais). */
export type EditarPatrimonioInput = z.infer<typeof editarPatrimonioSchema>

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

/** Revalida a tela de investimentos/patrimônio. */
function revalidarTelaInvestimentos(): void {
  revalidatePath('/[subcontaId]/investimentos', 'page')
}

/**
 * Normaliza categoria/finalidade conforme o tipo: só `investimento` carrega
 * `categoria_investimento`; imóvel/veículo zeram esse campo. A `finalidade`
 * (reserva × patrimônio) vale para qualquer ativo.
 */
function normalizarCarteira(
  tipo: Database['public']['Enums']['tipo_patrimonio'],
  categoria: CriarPatrimonioInput['categoriaInvestimento']
): Database['public']['Enums']['categoria_investimento'] | null {
  return tipo === 'investimento' ? categoria ?? null : null
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Cria uma linha de patrimônio (ativo da carteira) na subconta — tipo, descrição,
 * valor, rentabilidade, categoria de investimento e finalidade. Valida com `zod`
 * e revalida o acesso à subconta no servidor.
 */
export async function criarPatrimonio(
  subcontaId: string,
  dados: CriarPatrimonioInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const d = criarPatrimonioSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase.from('patrimonio').insert({
    subconta_id: id,
    tipo: d.tipo,
    descricao: d.descricao ?? null,
    valor: d.valor,
    rentabilidade: d.rentabilidade ?? 0,
    categoria_investimento: normalizarCarteira(d.tipo, d.categoriaInvestimento),
    finalidade: d.finalidade ?? null,
  })
  if (error) {
    throw new Error(`Erro ao criar patrimônio: ${error.message}`)
  }

  revalidarTelaInvestimentos()
  return { ok: true }
}

/**
 * Edita campos de uma linha de patrimônio. RLS garante o escopo; validamos o
 * acesso aqui também. Quando o `tipo` muda, a categoria é renormalizada.
 */
export async function editarPatrimonio(
  subcontaId: string,
  patrimonioId: string,
  dados: EditarPatrimonioInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const patId = z.string().uuid('Patrimônio inválido.').parse(patrimonioId)
  const d = editarPatrimonioSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const patch: Database['public']['Tables']['patrimonio']['Update'] = {}
  if (d.tipo !== undefined) patch.tipo = d.tipo
  if (d.descricao !== undefined) patch.descricao = d.descricao ?? null
  if (d.valor !== undefined) patch.valor = d.valor
  if (d.rentabilidade !== undefined) patch.rentabilidade = d.rentabilidade
  if (d.finalidade !== undefined) patch.finalidade = d.finalidade ?? null
  // Categoria depende do tipo efetivo (o novo, se enviado).
  if (d.tipo !== undefined || d.categoriaInvestimento !== undefined) {
    patch.categoria_investimento = normalizarCarteira(
      d.tipo ?? 'investimento',
      d.categoriaInvestimento
    )
  }

  const { error } = await supabase
    .from('patrimonio')
    .update(patch)
    .eq('id', patId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao editar patrimônio: ${error.message}`)
  }

  revalidarTelaInvestimentos()
  return { ok: true }
}

/** Remove uma linha de patrimônio da subconta. RLS protege; validamos também. */
export async function removerPatrimonio(
  subcontaId: string,
  patrimonioId: string
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const patId = z.string().uuid('Patrimônio inválido.').parse(patrimonioId)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase
    .from('patrimonio')
    .delete()
    .eq('id', patId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao remover patrimônio: ${error.message}`)
  }

  revalidarTelaInvestimentos()
  return { ok: true }
}
