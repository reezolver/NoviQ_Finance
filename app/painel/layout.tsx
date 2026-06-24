import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/workspace/AppSidebar"
import { Topbar } from "@/components/workspace/Topbar"

/**
 * Layout do painel de gestão — envolve o painel com a **mesma** sidebar do
 * workspace, em modo `gestao`. Acaba o "salto" entre dois headers: trocar
 * painel ↔ workspace mantém a moldura.
 *
 * Carrega aqui os dados que o switcher/footer precisam: a lista de subcontas
 * acessíveis (RLS-enforced) + o perfil do gestor. A lógica de dados do painel
 * (clientes/leads/anamneses) continua na `page`.
 */
export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")

  const supabase = await createSupabaseServerClient()
  const [{ data: subcontas }, { data: profile }] = await Promise.all([
    supabase
      .from("subcontas")
      .select("id, nome, tipo")
      .order("tipo", { ascending: true })
      .order("nome", { ascending: true }),
    supabase
      .from("profiles")
      .select("nome, email, avatar_url, preferencia_inicial")
      .eq("id", usuario.id)
      .maybeSingle(),
  ])

  const acessiveis = subcontas ?? []
  // Dicas de UI para os atalhos de "criar conta" do switcher (Spec 19 · RF-2.5).
  const temPessoal = acessiveis.some((s) => s.tipo === "pessoal")
  const clientesNoLimite =
    acessiveis.filter((s) => s.tipo === "cliente").length >= 3

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        variante="gestao"
        subcontas={acessiveis}
        isGestor
        isMaster={usuario.tipo_perfil === "master"}
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
          variante="gestao"
          perfil={{
            nome: profile?.nome,
            email: profile?.email,
            avatarUrl: profile?.avatar_url,
            preferenciaInicial:
              (profile?.preferencia_inicial as "pessoal" | "gestor" | null) ??
              null,
          }}
        />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
