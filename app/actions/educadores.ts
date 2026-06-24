'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { assertMaster } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { purgarContaPropria } from '@/lib/exclusao'

const userIdSchema = z.object({ userId: z.string().uuid() })

/**
 * @deprecated Spec 16 · RF-5 — modelo **sem aprovação**. O trigger da Spec 14 já
 * cria o educador como `educador/ativo` no auto-cadastro, então o cadastro não
 * promove mais nada e esta action **não é chamada por nenhum fluxo**. Mantida
 * temporariamente para não quebrar imports; pode ser removida (sem usos).
 *
 * Marca uma conta **recém-cadastrada** como **educador pendente**.
 *
 * Fluxo: a página `/cadastro` faz `supabase.auth.signUp({ email, password,
 * options: { data: { nome } } })` (o trigger cria o profile como
 * `cliente/pendente`), pega `data.user.id` e chama esta action passando o id.
 *
 * Via admin: seta o claim `app_metadata.tipo_perfil='educador'`,
 * `status='pendente'`, confirma o email (para o educador conseguir logar e
 * cair em "aguardando aprovação") e espelha em `profiles`.
 *
 * Segurança: callable sem sessão (o usuário acabou de se cadastrar). Por isso
 * só promove contas que estão **exatamente** em `cliente/pendente` — impede
 * escalonar/alterar uma conta já existente e ativa.
 */
export async function marcarComoEducadorPendente(userId: string) {
  const { userId: id } = userIdSchema.parse({ userId })
  const admin = createSupabaseAdminClient()

  const { data: profile, error: erroPerfil } = await admin
    .from('profiles')
    .select('tipo_perfil, status')
    .eq('id', id)
    .single()

  if (erroPerfil || !profile) {
    throw new Error('Perfil não encontrado.')
  }
  if (!(profile.tipo_perfil === 'cliente' && profile.status === 'pendente')) {
    throw new Error('Conta não elegível para se tornar educador pendente.')
  }

  const { error: erroAuth } = await admin.auth.admin.updateUserById(id, {
    email_confirm: true,
    app_metadata: { tipo_perfil: 'educador', status: 'pendente' },
  })
  if (erroAuth) {
    throw new Error(`Erro ao definir papel de educador: ${erroAuth.message}`)
  }

  const { error: erroUpdate } = await admin
    .from('profiles')
    .update({ tipo_perfil: 'educador', status: 'pendente' })
    .eq('id', id)
  if (erroUpdate) {
    throw new Error(`Erro ao atualizar perfil: ${erroUpdate.message}`)
  }

  return { ok: true as const }
}

/**
 * Aprova um educador pendente — **só master**.
 *
 * Spec 16 · §11.2: **mantida para reativação futura** de uma conta suspensa
 * (`status='inativo'`/`pendente`). No MVP **nenhum fluxo a dispara** (ninguém
 * nasce pendente no auto-cadastro), mas o gate de suspensão é reservado.
 *
 * Seta o claim `status='ativo'` (via admin) e espelha em `profiles`. O
 * educador precisa **refazer login** para o novo claim valer no JWT
 * (trade-off aceito).
 */
export async function aprovarEducador(userId: string) {
  const { userId: id } = userIdSchema.parse({ userId })
  await assertMaster()

  const admin = createSupabaseAdminClient()

  const { data: profile, error: erroPerfil } = await admin
    .from('profiles')
    .select('tipo_perfil, status')
    .eq('id', id)
    .single()

  if (erroPerfil || !profile) {
    throw new Error('Educador não encontrado.')
  }
  if (profile.tipo_perfil !== 'educador') {
    throw new Error('Usuário não é um educador.')
  }

  const { error: erroAuth } = await admin.auth.admin.updateUserById(id, {
    app_metadata: { tipo_perfil: 'educador', status: 'ativo' },
  })
  if (erroAuth) {
    throw new Error(`Erro ao aprovar educador: ${erroAuth.message}`)
  }

  const { error: erroUpdate } = await admin
    .from('profiles')
    .update({ status: 'ativo' })
    .eq('id', id)
  if (erroUpdate) {
    throw new Error(`Erro ao atualizar perfil: ${erroUpdate.message}`)
  }

  revalidatePath('/painel/educadores')
  return { ok: true as const }
}

/**
 * **Promove um educador a master** — só master (painel de Educadores).
 *
 * Seta o claim `app_metadata.tipo_perfil='master'` (via admin) e espelha em
 * `profiles`. Espelha o padrão de {@link aprovarEducador}. O usuário promovido
 * precisa **refazer login** para o novo claim valer no JWT — até lá a app já lê
 * o papel atualizado de `profiles` (fonte de {@link getUsuarioAtual}).
 *
 * Só promove quem está **exatamente** em `educador` — não mexe em clientes nem
 * em quem já é master.
 */
export async function promoverParaMaster(userId: string) {
  const { userId: id } = userIdSchema.parse({ userId })
  await assertMaster()

  const admin = createSupabaseAdminClient()

  const { data: profile, error: erroPerfil } = await admin
    .from('profiles')
    .select('tipo_perfil')
    .eq('id', id)
    .single()

  if (erroPerfil || !profile) {
    throw new Error('Educador não encontrado.')
  }
  if (profile.tipo_perfil !== 'educador') {
    throw new Error('Apenas um educador pode ser promovido a master.')
  }

  const { error: erroAuth } = await admin.auth.admin.updateUserById(id, {
    app_metadata: { tipo_perfil: 'master', status: 'ativo' },
  })
  if (erroAuth) {
    throw new Error(`Erro ao promover a master: ${erroAuth.message}`)
  }

  const { error: erroUpdate } = await admin
    .from('profiles')
    .update({ tipo_perfil: 'master', status: 'ativo' })
    .eq('id', id)
  if (erroUpdate) {
    throw new Error(`Erro ao atualizar perfil: ${erroUpdate.message}`)
  }

  revalidatePath('/painel/educadores')
  revalidatePath('/painel')
  return { ok: true as const }
}

/**
 * **Exclui permanentemente um educador** — só master (painel de Educadores).
 *
 * Reaproveita {@link purgarContaPropria}: apaga as carteiras **pessoais** do
 * educador + seus dados + o login. Os **clientes** dele **não** são apagados — a
 * FK `subcontas.gestor_id → auth.users ON DELETE SET NULL` os transforma em
 * "não atribuídos" (pool do master) no instante em que o login some. O master
 * reatribui depois pela aba Clientes.
 *
 * Salvaguardas: só exclui quem é `educador` (nunca outro master) e **nunca a si
 * mesmo** (auto-exclusão é feita na aba Conta, com reautenticação).
 */
export async function excluirEducador(userId: string) {
  const { userId: id } = userIdSchema.parse({ userId })
  const master = await assertMaster()

  if (id === master.id) {
    throw new Error(
      'Você não pode se excluir aqui — use a aba Conta para encerrar a sua conta.'
    )
  }

  const admin = createSupabaseAdminClient()

  const { data: profile, error: erroPerfil } = await admin
    .from('profiles')
    .select('tipo_perfil')
    .eq('id', id)
    .single()

  if (erroPerfil || !profile) {
    throw new Error('Educador não encontrado.')
  }
  if (profile.tipo_perfil !== 'educador') {
    throw new Error('Só é possível excluir contas de educador por aqui.')
  }

  await purgarContaPropria(admin, id)

  revalidatePath('/painel/educadores')
  revalidatePath('/painel')
  revalidatePath('/painel/clientes')
  return { ok: true as const }
}
