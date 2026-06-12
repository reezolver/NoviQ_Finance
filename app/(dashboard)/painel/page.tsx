/**
 * Painel do Educador (Server Component)
 *
 * Busca os dados dos clientes no Supabase e passa para o Client Component.
 * Tela exclusiva para educadores financeiros gerenciarem seus clientes.
 */

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PainelClient } from './PainelClient'

/**
 * Interface para subconta de cliente
 */
interface SubcontaCliente {
  id: string
  nome: string | null
  email: string | null
  status: 'ativo' | 'pendente' | 'inativo' | null
  created_at: string | null
  subconta_tipo: 'pessoal' | 'cliente' | null
}

export default async function PainelPage() {
  const supabase = await createSupabaseServerClient()

  // Buscar usuário autenticado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Buscar clientes do educador
  const { data: clientes } = await supabase
    .from('profiles')
    .select('id, nome, email, status, created_at, subconta_tipo')
    .eq('educador_id', user.id)
    .eq('tipo_perfil', 'cliente')
    .order('created_at', { ascending: false })

  return (
    <PainelClient
      clientes={(clientes as SubcontaCliente[]) || null}
    />
  )
}
