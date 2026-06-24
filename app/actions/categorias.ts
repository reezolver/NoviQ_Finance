'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

type GrupoCategoria = Database['public']['Enums']['grupo_categoria']

// ─── Schemas (sem `any`) ──────────────────────────────────────────────────────

const nomeSchema = z
  .string()
  .trim()
  .min(1, 'Informe o nome da categoria.')
  .max(60, 'Nome muito longo.')
const grupoSchema = z.enum(['fixa', 'variavel', 'investimento', 'renda'], {
  error: 'Selecione um grupo válido.',
})

const criarCategoriaSchema = z.object({
  nome: nomeSchema,
  grupo: grupoSchema,
})

/** Payload aceito por {@link criarCategoria}. */
export type CriarCategoriaInput = z.infer<typeof criarCategoriaSchema>

const editarCategoriaSchema = z.object({
  nome: nomeSchema.optional(),
  grupo: grupoSchema.optional(),
})

/** Payload aceito por {@link editarCategoria} (campos parciais). */
export type EditarCategoriaInput = z.infer<typeof editarCategoriaSchema>

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

/**
 * Rejeita nome duplicado **no mesmo grupo** da subconta (case-insensitive).
 * `ignorarId` exclui a própria linha na edição.
 */
async function assertNomeDisponivel(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  subcontaId: string,
  nome: string,
  grupo: GrupoCategoria,
  ignorarId?: string
): Promise<void> {
  let query = supabase
    .from('categorias')
    .select('id')
    .eq('subconta_id', subcontaId)
    .eq('grupo', grupo)
    .ilike('nome', nome)
  if (ignorarId) query = query.neq('id', ignorarId)

  const { data } = await query.maybeSingle()
  if (data) {
    throw new Error(`Já existe uma categoria "${nome}" nesse grupo.`)
  }
}

/** Revalida a tela de categorias + as telas que consomem a lista (modal/planejado). */
function revalidarTelasCategorias(): void {
  revalidatePath('/[subcontaId]/categorias', 'page')
  revalidatePath('/[subcontaId]/mensal/[ano]/[mes]', 'page')
  revalidatePath('/[subcontaId]/controle-anual', 'page')
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Cria uma categoria na subconta. O `grupo` define se ela é uma despesa Fixa,
 * Variável, de Investimento ou uma Renda (receita) — é dele que cada lançamento
 * herda a classificação Fixa/Variável (não há campo de grupo no lançamento de
 * despesa). Retorna o `id` para o chamador poder pré-selecioná-la (atalho do
 * modal de lançamento).
 *
 * - Valida tudo com `zod` e **revalida o acesso à subconta no servidor**.
 * - `ordem` = (maior ordem da subconta) + 1, para a nova entrar no fim da lista.
 */
export async function criarCategoria(
  subcontaId: string,
  dados: CriarCategoriaInput
): Promise<{ ok: true; id: string }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const dadosValidados = criarCategoriaSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)
  await assertNomeDisponivel(supabase, id, dadosValidados.nome, dadosValidados.grupo)

  // Próxima ordem: fim da lista da subconta (lista vazia → 0).
  const { data: ultima } = await supabase
    .from('categorias')
    .select('ordem')
    .eq('subconta_id', id)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()
  const proximaOrdem = (ultima?.ordem ?? -1) + 1

  const { data, error } = await supabase
    .from('categorias')
    .insert({
      subconta_id: id,
      nome: dadosValidados.nome,
      grupo: dadosValidados.grupo,
      ordem: proximaOrdem,
      is_default: false,
    })
    .select('id')
    .single()
  if (error || !data) {
    throw new Error(`Erro ao criar categoria: ${error?.message ?? 'desconhecido'}`)
  }

  revalidarTelasCategorias()
  return { ok: true, id: data.id }
}

/**
 * Edita uma categoria (renomear e/ou trocar o grupo). Trocar o grupo reclassifica
 * todos os lançamentos da categoria (a classificação é derivada dela). A RLS de
 * `categorias` garante o escopo; validamos o acesso aqui também.
 */
export async function editarCategoria(
  subcontaId: string,
  categoriaId: string,
  dados: EditarCategoriaInput
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const catId = z.string().uuid('Categoria inválida.').parse(categoriaId)
  const dadosValidados = editarCategoriaSchema.parse(dados)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  // Para checar duplicidade precisamos do grupo final (informado ou atual).
  const { data: atual } = await supabase
    .from('categorias')
    .select('nome, grupo')
    .eq('id', catId)
    .eq('subconta_id', id)
    .maybeSingle()
  if (!atual) {
    throw new Error('Categoria não encontrada ou sem acesso.')
  }

  const nomeFinal = dadosValidados.nome ?? atual.nome
  const grupoFinal = (dadosValidados.grupo ?? atual.grupo) as GrupoCategoria
  await assertNomeDisponivel(supabase, id, nomeFinal, grupoFinal, catId)

  const patch: Database['public']['Tables']['categorias']['Update'] = {}
  if (dadosValidados.nome !== undefined) patch.nome = dadosValidados.nome
  if (dadosValidados.grupo !== undefined) patch.grupo = dadosValidados.grupo

  const { error } = await supabase
    .from('categorias')
    .update(patch)
    .eq('id', catId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao editar categoria: ${error.message}`)
  }

  revalidarTelasCategorias()
  return { ok: true }
}

/**
 * Remove uma categoria da subconta. Bloqueia se houver lançamentos vinculados
 * (a FK `lancamentos.categoria_id` é `NO ACTION`), com mensagem amigável. Os
 * orçamentos vinculados somem em cascata (FK `CASCADE`). RLS protege também.
 */
export async function removerCategoria(
  subcontaId: string,
  categoriaId: string
): Promise<{ ok: true }> {
  const id = z.string().uuid('Subconta inválida.').parse(subcontaId)
  const catId = z.string().uuid('Categoria inválida.').parse(categoriaId)
  const supabase = await createSupabaseServerClient()

  await assertAcessoSubconta(supabase, id)

  const { count } = await supabase
    .from('lancamentos')
    .select('id', { count: 'exact', head: true })
    .eq('subconta_id', id)
    .eq('categoria_id', catId)
  if (count && count > 0) {
    throw new Error(
      `Esta categoria tem ${count} lançamento(s) e não pode ser excluída. ` +
        'Remova ou reclassifique os lançamentos antes.'
    )
  }

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', catId)
    .eq('subconta_id', id)
  if (error) {
    throw new Error(`Erro ao remover categoria: ${error.message}`)
  }

  revalidarTelasCategorias()
  return { ok: true }
}
