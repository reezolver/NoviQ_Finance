/**
 * Painel do Educador (Server Component)
 *
 * Busca os dados das subcontas no Supabase e passa para o Client Component.
 * Visual estilo Google Tag Manager com containers por subconta.
 */

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PainelContainer } from './PainelContainer'

/**
 * Interface para subconta de cliente
 */
interface Subconta {
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

  // Buscar subcontas do educador
  const { data: subcontas } = await supabase
    .from('profiles')
    .select('id, nome, email, status, created_at, subconta_tipo')
    .eq('educador_id', user.id)
    .eq('tipo_perfil', 'cliente')
    .order('created_at', { ascending: false })

  return (
    <PainelContainer
      subcontas={(subcontas as Subconta[]) ?? []}
    />
  )
}
