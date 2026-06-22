'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase-server'
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

  const { error } = await supabase.from('objetivos').insert({
    subconta_id: id,
    nome: dadosValidados.nome,
    valor_alvo: dadosValidados.valorAlvo,
    data_limite: dadosValidados.dataLimite,
    valor_inicial: dadosValidados.valorInicial ?? 0,
  })
  if (error) {
    throw new Error(`Erro ao criar objetivo: ${error.message}`)
  }

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
