/**
 * Painel do Educador - Lista de Clientes (Server Component)
 *
 * Busca os dados dos clientes no Supabase e passa para o Client Component.
 * Visual estilo Google Tag Manager com containers por cliente.
 */

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PainelContainer } from './PainelContainer'

interface Cliente {
  id: string
  nome: string | null
  email: string | null
  status: 'ativo' | 'pendente' | 'inativo' | null
  created_at: string | null
}

export default async function PainelClientesPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: clientes } = await supabase
    .from('profiles')
    .select('id, nome, email, status, created_at')
    .eq('educador_id', user.id)
    .eq('tipo_perfil', 'cliente')
    .order('created_at', { ascending: false })

  return (
    <PainelContainer
      clientes={(clientes as Cliente[]) ?? []}
    />
  )
}
