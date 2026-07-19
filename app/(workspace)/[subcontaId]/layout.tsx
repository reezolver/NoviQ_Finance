import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { atingiuLimite } from "@/lib/limites-subconta"
import { AppSidebar } from "@/components/workspace/AppSidebar"
import { Topbar } from "@/components/workspace/Topbar"

/**
 * Layout do route group de workspace — escopa e **valida o acesso** à subconta
 * da URL no servidor, e monta a **moldura única** (sidebar + topbar) ao redor
 * das 5 seções financeiras.
 *
 * A query de `subcontas` roda com o client de usuário (RLS-enforced). A policy
 * `can_access_subconta` autoriza dono (`owner_user_id`), gestor (`gestor_id`) e
 * master (sobre subcontas `cliente`). **Se a subconta da URL não estiver entre
 * as acessíveis, a RLS já negou** (ou o id não existe) → `notFound()`. Nunca
 * decidimos acesso no frontend; só refletimos o que o Postgres autorizou.
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
  const usuario = await getUsuarioAtual()

  // Subcontas acessíveis (RLS) alimentam o switcher; perfil alimenta o footer.
  const [{ data: subcontas }, { data: profile }] = await Promise.all([
    supabase
      .from("subcontas")
      .select("id, nome, tipo")
      .order("tipo", { ascending: true })
      .order("nome", { ascending: true }),
    supabase
      .from("profiles")
      .select("nome, email, avatar_url, preferencia_inicial")
      .eq("id", usuario?.id ?? "")
      .maybeSingle(),
  ])

  const acessiveis = subcontas ?? []
  const ativa = acessiveis.find((s) => s.id === subcontaId)
  if (!ativa) {
    notFound()
  }

  // "Voltar/gestão" só faz sentido para o gestor (educador/master).
  const isGestor =
    usuario?.tipo_perfil === "educador" || usuario?.tipo_perfil === "master"

  // Dicas de UI para os atalhos de "criar conta" do switcher (Spec 19 · RF-2.5).
  // A barreira real do limite continua na action + trigger do banco.
  const temPessoal = acessiveis.some((s) => s.tipo === "pessoal")
  // Teto vem da fonte única por perfil (Spec 32) — o `>= 3` solto que existia
  // aqui era a terceira cópia do número e divergia do banco para o master.
  const clientesNoLimite = atingiuLimite(
    usuario?.tipo_perfil,
    "cliente",
    acessiveis.filter((s) => s.tipo === "cliente").length
  )

  // Estado aberto/fechado persistido no cookie nativo do componente.
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        variante="workspace"
        subcontas={acessiveis}
        subcontaAtivaId={subcontaId}
        isGestor={isGestor}
        temPessoal={temPessoal}
        clientesNoLimite={clientesNoLimite}
        perfil={{
          nome: profile?.nome,
          email: profile?.email,
          avatarUrl: profile?.avatar_url,
          preferenciaInicial:
            (profile?.preferencia_inicial as "pessoal" | "gestor" | null) ?? null,
        }}
      />
      <SidebarInset>
        <Topbar
          variante="workspace"
          contaNome={ativa.nome}
          perfil={{
            nome: profile?.nome,
            email: profile?.email,
            avatarUrl: profile?.avatar_url,
            preferenciaInicial:
              (profile?.preferencia_inicial as "pessoal" | "gestor" | null) ??
              null,
          }}
        />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
