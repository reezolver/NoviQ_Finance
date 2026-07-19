'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase-server'

// ─── Schemas (sem `any`) ──────────────────────────────────────────────────────

const anoSchema = z
  .number({ error: 'Informe o ano.' })
  .int()
  .min(2000, 'Ano inválido.')
  .max(2100, 'Ano inválido.')
const mesSchema = z
  .number({ error: 'Informe o mês.' })
  .int()
  .min(1, 'Mês inválido.')
  .max(12, 'Mês inválido.')

const definirPlanejadoSchema = z.object({
  categoriaId: z.string().uuid('Categoria inválida.'),
  // `valorPlanejado = 0` é gravação válida (zera o planejado).
  valorPlanejado: z
    .number({ error: 'Informe um valor.' })
    .min(0, 'O valor não pode ser negativo.'),
  ano: anoSchema,
  mes: mesSchema,
  // default false → grava override do mês (ano+mes); true → recorrente.
  recorrente: z.boolean().optional().default(false),
})

/** Payload aceito por {@link definirPlanejado}. */
export type DefinirPlanejadoInput = z.infer<typeof definirPlanejadoSchema>

const removerPlanejadoSchema = z.object({
  categoriaId: z.string().uuid('Categoria inválida.'),
  ano: anoSchema,
  mes: mesSchema,
  recorrente: z.boolean().optional().default(false),
})

/** Payload aceito por {@link removerPlanejado}. */
export type RemoverPlanejadoInput = z.infer<typeof removerPlanejadoSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Confirma que a subconta existe **e é acessível** pelo usuário atual (RLS-
 * enforced). Defesa em profundidade — a RLS de `orcamentos`
 * (`can_access_subconta`) continua sendo a rede final. Espelha o helper de
 * `app/actions/lancamentos.ts`.
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

/** Confirma que a categoria pertence à subconta (RLS-enforced). */
async function assertCategoriaDaSubconta(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  subcontaId: string,
  categoriaId: string
): Promise<void> {
  const { data } = await supabase
    .from('categorias')
    .select('id')
    .eq('id', categoriaId)
    .eq('subconta_id', subcontaId)
    .maybeSingle()
  if (!data) {
    throw new Error('Categoria inválida para esta subconta.')
  }
}

/** Revalida as telas que leem o planejado (mensal + anual). */
function revalidarTelasFinanceiras(): void {
  revalidatePath('/[subcontaId]/mensal/[ano]/[mes]', 'page')
  revalidatePath('/[subcontaId]/controle-anual', 'page')
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Define/edita o **planejado** de UMA categoria (RF-1, Spec 23).
 *
 * - Por padrão grava o **override do mês** (`ano`+`mes`), preservando os outros
 *   meses e o recorrente herdado.
 * - Com `recorrente: true`, grava a linha **recorrente** (`ano=null, mes=null`),
 *   que vale para todo mês sem override.
 * - `valorPlanejado = 0` é gravação válida (zera). Para remover a linha, use
 *   {@link removerPlanejado}.
 * - Upsert idempotente apoiado no índice único
 *   `orcamentos_unico_categoria_mes` (NULLS NOT DISTINCT).
 */
export async function definirPlanejado(
  subcontaId: string,
  dados: DefinirPlanejadoInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const { categoriaId, valorPlanejado, ano, mes, recorrente } =
    definirPlanejadoSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)
  await assertCategoriaDaSubconta(supabase, id, categoriaId)

  const { error } = await supabase.from('orcamentos').upsert(
    {
      subconta_id: id,
      categoria_id: categoriaId,
      valor_planejado: valorPlanejado,
      ano: recorrente ? null : ano,
      mes: recorrente ? null : mes,
      // Esta action é sempre o educador digitando. Marcar como `manual` é o que
      // protege o valor de ser sobrescrito quando o objetivo repropagar
      // (Spec 36 · R4).
      origem: 'manual' as const,
    },
    { onConflict: 'subconta_id,categoria_id,ano,mes' }
  )
  if (error) {
    throw new Error(`Erro ao salvar o planejado: ${error.message}`)
  }

  revalidarTelasFinanceiras()
  return { ok: true }
}

/**
 * Remove a linha de planejado correspondente — o override do mês
 * (`recorrente: false`) **ou** a linha recorrente (`recorrente: true`). Sem a
 * linha, a leitura volta a herdar o recorrente (override removido) ou a zero
 * (recorrente removido).
 */
export async function removerPlanejado(
  subcontaId: string,
  dados: RemoverPlanejadoInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const { categoriaId, ano, mes, recorrente } = removerPlanejadoSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  let query = supabase
    .from('orcamentos')
    .delete()
    .eq('subconta_id', id)
    .eq('categoria_id', categoriaId)

  // `.is()` para os NULLs do recorrente; `.eq()` para o override do mês.
  query = recorrente
    ? query.is('ano', null).is('mes', null)
    : query.eq('ano', ano).eq('mes', mes)

  const { error } = await query
  if (error) {
    throw new Error(`Erro ao remover o planejado: ${error.message}`)
  }

  revalidarTelasFinanceiras()
  return { ok: true }
}
