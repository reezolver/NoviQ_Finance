'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase-server'

/**
 * CRUD de **cartões de crédito** (Spec 38 · RF‑18).
 *
 * Segue o padrão das demais actions: `zod` + acesso revalidado no servidor +
 * `revalidatePath`. A RLS de `cartoes` (`can_access_subconta`) é a rede final —
 * o frontend nunca decide acesso.
 */

const diaSchema = z
  .number({ error: 'Informe o dia.' })
  .int('Use um dia inteiro.')
  .min(1, 'O dia deve ser entre 1 e 31.')
  .max(31, 'O dia deve ser entre 1 e 31.')

const cartaoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome do cartão.')
    .max(60, 'Nome muito longo.'),
  diaFechamento: diaSchema,
  diaVencimento: diaSchema,
})

export type CartaoInput = z.infer<typeof cartaoSchema>

async function assertAcessoSubconta(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  subcontaId: string
): Promise<void> {
  const { data } = await supabase
    .from('subcontas')
    .select('id')
    .eq('id', subcontaId)
    .maybeSingle()
  if (!data) throw new Error('Subconta não encontrada ou sem acesso.')
}

function revalidarTelas(): void {
  revalidatePath('/[subcontaId]/categorias', 'page')
  revalidatePath('/[subcontaId]/mensal/[ano]/[mes]', 'page')
}

/** Cria um cartão na subconta. */
export async function criarCartao(
  subcontaId: string,
  dados: CartaoInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const d = cartaoSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase.from('cartoes').insert({
    subconta_id: id,
    nome: d.nome,
    dia_fechamento: d.diaFechamento,
    dia_vencimento: d.diaVencimento,
  })
  if (error) throw new Error(`Erro ao criar cartão: ${error.message}`)

  revalidarTelas()
  return { ok: true }
}

/**
 * Edita um cartão.
 *
 * ⚠️ **Não remaneja lançamentos passados (R19.4).** O mês de fatura já foi
 * resolvido e persistido em cada lançamento; mudar o dia de fechamento vale
 * daqui pra frente. Reescrever o histórico ao mexer numa configuração seria
 * alterar o passado financeiro do cliente sem ele pedir.
 */
export async function editarCartao(
  subcontaId: string,
  cartaoId: string,
  dados: CartaoInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const cId = z.string().uuid('Cartão inválido.').parse(cartaoId)
  const d = cartaoSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase
    .from('cartoes')
    .update({
      nome: d.nome,
      dia_fechamento: d.diaFechamento,
      dia_vencimento: d.diaVencimento,
    })
    .eq('id', cId)
    .eq('subconta_id', id)
  if (error) throw new Error(`Erro ao editar cartão: ${error.message}`)

  revalidarTelas()
  return { ok: true }
}

/**
 * Exclui um cartão (soft delete, como o lançamento na Spec 37).
 *
 * Os lançamentos feitos nele **continuam existindo** e no mês de fatura em que
 * já estavam: apagar um cartão não pode sumir com despesa do histórico.
 */
export async function removerCartao(
  subcontaId: string,
  cartaoId: string
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const cId = z.string().uuid('Cartão inválido.').parse(cartaoId)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { error } = await supabase
    .from('cartoes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', cId)
    .eq('subconta_id', id)
    .is('deleted_at', null)
  if (error) throw new Error(`Erro ao excluir cartão: ${error.message}`)

  revalidarTelas()
  return { ok: true }
}
