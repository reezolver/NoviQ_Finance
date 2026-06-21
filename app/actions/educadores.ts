'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { assertMaster } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const userIdSchema = z.object({ userId: z.string().uuid() })

/**
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

  revalidatePath('/master/educadores')
  return { ok: true as const }
}
