import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

export type TipoPerfil = Database['public']['Enums']['tipo_perfil']
export type StatusPerfil = Database['public']['Enums']['status_perfil']

export interface UsuarioAtual {
  id: string
  tipo_perfil: TipoPerfil
  status: StatusPerfil
}

/**
 * Resolve o usuário logado a partir do cookie de sessão (JWT) + `profiles`.
 * Retorna `null` se não houver sessão ou perfil. Lê `profiles` (fonte
 * atualizada pelas actions) em vez do claim do JWT, que pode estar defasado
 * até o próximo login.
 */
export async function getUsuarioAtual(): Promise<UsuarioAtual | null> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('tipo_perfil, status')
    .eq('id', user.id)
    .single()
  if (!profile) return null

  return {
    id: user.id,
    tipo_perfil: profile.tipo_perfil,
    status: profile.status,
  }
}

/**
 * Barra a execução se o usuário não for um **gestor** — isto é, `master` ou
 * `educador` com `status='ativo'`. Toda action privilegiada chama isto
 * **primeiro**. Retorna o usuário para reuso (ex.: `auth.uid()`).
 */
export async function assertGestor(): Promise<UsuarioAtual> {
  const usuario = await getUsuarioAtual()
  if (!usuario) throw new Error('Não autenticado.')

  const isMaster = usuario.tipo_perfil === 'master'
  const isEducadorAtivo =
    usuario.tipo_perfil === 'educador' && usuario.status === 'ativo'

  if (!isMaster && !isEducadorAtivo) {
    throw new Error('Acesso negado: requer educador ativo ou master.')
  }
  return usuario
}

/**
 * Barra a execução se o usuário não for `master`. Usado em ações exclusivas
 * do master (aprovar educador, mover cliente entre gestores).
 */
export async function assertMaster(): Promise<UsuarioAtual> {
  const usuario = await getUsuarioAtual()
  if (!usuario || usuario.tipo_perfil !== 'master') {
    throw new Error('Acesso negado: requer master.')
  }
  return usuario
}
