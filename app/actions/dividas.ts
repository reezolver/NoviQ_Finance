'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

// ─── Schemas (sem `any`) ──────────────────────────────────────────────────────

const valorNaoNegativo = z
  .number({ error: 'Informe um valor.' })
  .min(0, 'O valor não pode ser negativo.')
const tipoSchema = z
  .string()
  .trim()
  .min(1, 'Informe o tipo da dívida.')
  .max(120, 'Tipo muito longo.')
const parcelasSchema = z
  .number({ error: 'Informe as parcelas.' })
  .int('Parcelas deve ser inteiro.')
  .min(0, 'Parcelas não pode ser negativo.')
const scoreFaixaSchema = z.string().trim().max(60, 'Faixa muito longa.').optional()

const criarDividaSchema = z.object({
  tipo: tipoSchema,
  valorTotal: valorNaoNegativo,
  valorParcela: valorNaoNegativo.optional(),
  parcelasRestantes: parcelasSchema.optional(),
  taxa: valorNaoNegativo.optional(),
  scoreFaixa: scoreFaixaSchema,
})

/** Payload aceito por {@link criarDivida}. */
export type CriarDividaInput = z.infer<typeof criarDividaSchema>

const editarDividaSchema = criarDividaSchema.partial()

/** Payload aceito por {@link editarDivida} (campos parciais). */
export type EditarDividaInput = z.infer<typeof editarDividaSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Confirma que a subconta existe **e é acessível** pelo usuário atual (query
 * RLS-enforced). Defesa em profundidade — a RLS continua sendo a rede final.
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

/** Revalida a tela de investimentos/patrimônio (onde as dívidas entram no PL). */
function revalidarTelaInvestimentos(): void {
  revalidatePath('/[subcontaId]/investimentos', 'page')
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Cria uma dívida na subconta. O `valor_total` entra no cálculo do Patrimônio
 * Líquido (`Σ patrimônio − Σ dívidas`). Valida com `zod` e revalida o acesso.
 */
export async function criarDivida(
  subcontaId: string,
  dados: CriarDividaInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const d = criarDividaSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase.from('dividas').insert({
    subconta_id: id,
    tipo: d.tipo,
    valor_total: d.valorTotal,
    valor_parcela: d.valorParcela ?? 0,
    parcelas_restantes: d.parcelasRestantes ?? 0,
    taxa: d.taxa ?? 0,
    score_faixa: d.scoreFaixa ?? null,
  })
  if (error) {
    throw new Error(`Erro ao criar dívida: ${error.message}`)
  }

  revalidarTelaInvestimentos()
  return { ok: true }
}

/** Edita campos de uma dívida existente. RLS protege; validamos o acesso também. */
export async function editarDivida(
  subcontaId: string,
  dividaId: string,
  dados: EditarDividaInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const divId = z.string().uuid('Dívida inválida.').parse(dividaId)
  const d = editarDividaSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const patch: Database['public']['Tables']['dividas']['Update'] = {}
  if (d.tipo !== undefined) patch.tipo = d.tipo
  if (d.valorTotal !== undefined) patch.valor_total = d.valorTotal
  if (d.valorParcela !== undefined) patch.valor_parcela = d.valorParcela
  if (d.parcelasRestantes !== undefined) patch.parcelas_restantes = d.parcelasRestantes
  if (d.taxa !== undefined) patch.taxa = d.taxa
  if (d.scoreFaixa !== undefined) patch.score_faixa = d.scoreFaixa ?? null

  const { error } = await supabase
    .from('dividas')
    .update(patch)
    .eq('id', divId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao editar dívida: ${error.message}`)
  }

  revalidarTelaInvestimentos()
  return { ok: true }
}

/** Remove uma dívida da subconta. RLS protege; validamos o acesso também. */
export async function removerDivida(
  subcontaId: string,
  dividaId: string
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const divId = z.string().uuid('Dívida inválida.').parse(dividaId)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase
    .from('dividas')
    .delete()
    .eq('id', divId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao remover dívida: ${error.message}`)
  }

  revalidarTelaInvestimentos()
  return { ok: true }
}
