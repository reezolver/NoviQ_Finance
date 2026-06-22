import { notFound } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader'

/**
 * Layout do route group de workspace — escopa e **valida o acesso** à subconta
 * da URL no servidor.
 *
 * A query roda com o client de usuário (RLS-enforced). A policy
 * `can_access_subconta` autoriza dono (`owner_user_id`), gestor (`gestor_id`)
 * e master (sobre subcontas `cliente`). **Se a query voltar vazia, a RLS já
 * negou** (ou o id não existe) → `notFound()`. Nunca decidimos acesso no
 * frontend; só refletimos o que o Postgres autorizou.
 */
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ subcontaId: string }>
}) {
  const { subcontaId } = await params
  const supabase = await createSupabaseServerClient()

  // Todas as subcontas acessíveis (RLS-enforced) alimentam o seletor de
  // subconta no header. Se a subconta da URL não estiver entre elas, a RLS
  // negou (ou o id não existe) → `notFound()`.
  const { data: subcontas } = await supabase
    .from('subcontas')
    .select('id, nome, tipo')
    .order('tipo', { ascending: true })
    .order('nome', { ascending: true })

  const acessiveis = subcontas ?? []
  if (!acessiveis.some((s) => s.id === subcontaId)) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WorkspaceHeader subcontas={acessiveis} subcontaAtivaId={subcontaId} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
