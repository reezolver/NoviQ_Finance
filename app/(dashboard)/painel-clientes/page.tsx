/**
 * Painel de Clientes do Educador (Server Component)
 *
 * Busca os dados dos clientes no Supabase e passa para o Client Component.
 * Esta é a primeira tela que o educador vê ao fazer login.
 */

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PainelClientesClient } from './PainelClientesClient'

/**
 * Interface para o perfil do cliente retornado pelo Supabase
 */
interface ClientePerfil {
  id: string
  nome: string | null
  status: 'ativo' | 'pendente' | 'inativo' | null
  created_at: string | null
}

export default async function PainelClientesPage() {
  const supabase = await createSupabaseServerClient()

  // Buscar usuário autenticado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Buscar clientes do educador
  const { data: clientes } = await supabase
    .from('profiles')
    .select('id, nome, status, created_at')
    .eq('educador_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <PainelClientesClient
      clientes={(clientes as ClientePerfil[]) || null}
    />
  )
}
