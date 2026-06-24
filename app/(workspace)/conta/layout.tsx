import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/workspace/AppSidebar"
import { Topbar } from "@/components/workspace/Topbar"

/**
 * Layout da **página de Conta** (Spec 22 · RF-4.0) — vive no grupo
 * `(workspace)` mas **fora** do `[subcontaId]` (que valida acesso a subconta),
 * porque a conta independe de qualquer carteira. Reusa a **mesma moldura**
 * (sidebar + topbar) das demais áreas para não haver "salto" de header.
 *
 * Sem `[subcontaId]` na URL, escolhemos um alvo de navegação para a sidebar: a
 * carteira **pessoal** (ou a 1ª acessível). Se houver, a nav usa a variante
 * `workspace` apontando para ela; sem nenhuma carteira, cai para a `gestao`
 * (link do painel). O switcher e o footer (com avatar) aparecem sempre.
 */
export default async function ContaLayout({
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
  const isGestor =
    usuario.tipo_perfil === "educador" || usuario.tipo_perfil === "master"

  // Alvo de navegação da sidebar (a conta não tem subconta na URL).
  const alvoNav =
    acessiveis.find((s) => s.tipo === "pessoal") ?? acessiveis[0] ?? null

  const temPessoal = acessiveis.some((s) => s.tipo === "pessoal")
  const clientesNoLimite =
    acessiveis.filter((s) => s.tipo === "cliente").length >= 3

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        variante={alvoNav ? "workspace" : "gestao"}
        subcontas={acessiveis}
        subcontaAtivaId={alvoNav?.id}
        isGestor={isGestor}
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
          titulo="Conta"
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
