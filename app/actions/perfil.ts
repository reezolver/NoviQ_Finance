'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getUsuarioAtual } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { purgarContaPropria } from '@/lib/exclusao'

/**
 * Ban "permanente" (≈100 anos) aplicado ao próprio login na exclusão temporária
 * — o usuário para de entrar na hora. O Supabase Auth espera o formato Go.
 * Espelha o `BAN_DURACAO` de {@link file://./subcontas.ts}.
 */
const BAN_DURACAO = '876000h'

const atualizarPerfilSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório.').max(80, 'Nome muito longo.'),
})

/**
 * Atualiza o **nome** do próprio usuário em `profiles` (Spec 22 · RF-4.1).
 * Roda pelo client de usuário — a RLS de UPDATE do próprio perfil
 * (`id = auth.uid()`) já autoriza. É a identidade do usuário, distinta do nome
 * da carteira (`subcontas.nome`, renomeável na Spec 20).
 */
export async function atualizarPerfil(nome: string) {
  const dados = atualizarPerfilSchema.parse({ nome })
  const usuario = await getUsuarioAtual()
  if (!usuario) throw new Error('Não autenticado.')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('profiles')
    .update({ nome: dados.nome })
    .eq('id', usuario.id)
  if (error) throw new Error(`Erro ao atualizar o perfil: ${error.message}`)

  revalidatePath('/conta')
  return { ok: true as const }
}

/** Formatos e tamanho aceitos para a foto de perfil (espelha a UI). */
const AVATAR_FORMATOS = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_TAMANHO_MAX = 2 * 1024 * 1024 // 2 MB

/**
 * **Sobe a foto de perfil e grava a URL** em `profiles.avatar_url`
 * (Spec 22 · RF-4.1). Roda **no servidor** com a **service-role** (admin):
 *
 * O upload feito pelo browser esbarrava na RLS de Storage (`new row violates
 * row-level security policy`) porque a requisição nem sempre chegava
 * autenticada como dono da pasta `{uid}/`. Fazendo no servidor, a identidade
 * vem de {@link getUsuarioAtual} (cookie) e o admin bypassa a RLS — o caminho
 * continua namespaced por `uid`, então um usuário só grava na própria pasta.
 *
 * Recebe o arquivo via `FormData` (server action). Valida tipo e tamanho de
 * novo no servidor (defesa em profundidade). Retorna a URL pública.
 */
export async function salvarAvatar(formData: FormData) {
  const usuario = await getUsuarioAtual()
  if (!usuario) throw new Error('Não autenticado.')

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Arquivo inválido.')
  }
  if (!AVATAR_FORMATOS.includes(file.type)) {
    throw new Error('Use uma imagem JPG, PNG ou WEBP.')
  }
  if (file.size > AVATAR_TAMANHO_MAX) {
    throw new Error('A imagem deve ter no máximo 2 MB.')
  }

  const admin = createSupabaseAdminClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const caminho = `${usuario.id}/avatar-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: erroUpload } = await admin.storage
    .from('avatars')
    .upload(caminho, buffer, { upsert: true, contentType: file.type })
  if (erroUpload) {
    throw new Error(`Erro ao enviar a imagem: ${erroUpload.message}`)
  }

  const {
    data: { publicUrl },
  } = admin.storage.from('avatars').getPublicUrl(caminho)

  const { error } = await admin
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', usuario.id)
  if (error) {
    throw new Error(`Erro ao salvar a foto: ${error.message}`)
  }

  revalidatePath('/conta')
  revalidatePath('/painel')
  return { url: publicUrl }
}

const atualizarAvatarSchema = z.object({
  // URL pública do arquivo no bucket `avatars` (ou null para remover a foto).
  url: z.string().url().nullable(),
})

/**
 * Grava a **URL pública do avatar** em `profiles.avatar_url` (Spec 22 · RF-4.1).
 * O upload do arquivo acontece no client (Storage, bucket `avatars`, prefixo
 * `{uid}/...`); aqui só persistimos a URL resultante. `null` remove a foto.
 *
 * O avatar passa a alimentar o footer da sidebar e o account switcher — por isso
 * revalidamos as molduras que os renderizam.
 */
export async function atualizarAvatar(url: string | null) {
  const dados = atualizarAvatarSchema.parse({ url })
  const usuario = await getUsuarioAtual()
  if (!usuario) throw new Error('Não autenticado.')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: dados.url })
    .eq('id', usuario.id)
  if (error) throw new Error(`Erro ao atualizar a foto: ${error.message}`)

  revalidatePath('/conta')
  revalidatePath('/painel')
  return { ok: true as const }
}

const excluirMinhaContaSchema = z.object({
  modo: z.enum(['temporario', 'permanente']),
})

/**
 * **Auto-exclusão da própria conta** (Spec 22 · RF-4.4) nas duas modalidades da
 * Spec 21:
 *
 * - **`temporario` (soft-delete):** marca `profiles.deleted_at = now()` +
 *   `status = 'inativo'` e **bane o login na hora**. Recuperável dentro da
 *   janela de 90 dias (purga automática da Spec 21 depois disso).
 * - **`permanente` (hard-delete):** purga ponta a ponta via
 *   {@link purgarContaPropria} — apaga as carteiras **pessoais** + dados + o
 *   login. Os **clientes** sobrevivem como pool do master (`gestor_id → null`).
 *
 * **Re-autenticação (D5):** a confirmação de senha atual é feita no client
 * (`signInWithPassword`) imediatamente antes de invocar esta action — coerente
 * com a troca de senha/e-mail, que também roda no client autenticado. A action
 * só age sobre a sessão validada (`getUsuarioAtual`).
 *
 * Após o sucesso, a UI faz `signOut` + redireciona para `/login`.
 */
export async function excluirMinhaConta(modo: 'temporario' | 'permanente') {
  const dados = excluirMinhaContaSchema.parse({ modo })
  const usuario = await getUsuarioAtual()
  if (!usuario) throw new Error('Não autenticado.')

  const admin = createSupabaseAdminClient()

  if (dados.modo === 'permanente') {
    await purgarContaPropria(admin, usuario.id)
    revalidatePath('/painel')
    return { ok: true as const }
  }

  // temporario: soft-delete do próprio perfil + suspender o login na hora.
  // Via admin: a auto-inativação é privilegiada e não depende das nuances da
  // policy de UPDATE do próprio perfil.
  const { error: erroPerfil } = await admin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString(), status: 'inativo' })
    .eq('id', usuario.id)
  if (erroPerfil) {
    throw new Error(`Erro ao desativar a conta: ${erroPerfil.message}`)
  }

  const { error: erroBan } = await admin.auth.admin.updateUserById(usuario.id, {
    ban_duration: BAN_DURACAO,
  })
  if (erroBan) {
    throw new Error(`Conta desativada, mas falhou ao suspender o login: ${erroBan.message}`)
  }

  revalidatePath('/painel')
  return { ok: true as const }
}
