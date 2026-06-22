import { redirect } from "next/navigation"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { OnboardingChooser } from "@/components/onboarding/OnboardingChooser"

/**
 * Onboarding por intenção (Spec 17 · §3.3) — a pergunta única do 1º acesso.
 *
 * Autenticada: sem sessão → `/login`. Se a `preferencia_inicial` já estiver
 * setada (ou for `master`), redireciona para a home correspondente (não repete o
 * onboarding). O roteamento canônico vive no `middleware`; aqui só evitamos
 * revisitar a tela.
 */
export default async function OnboardingPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")

  // Master nunca passa pelo onboarding (tratado como gestor por padrão).
  if (usuario.tipo_perfil === "master") redirect("/painel")

  const supabase = await createSupabaseServerClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferencia_inicial")
    .eq("id", usuario.id)
    .maybeSingle()

  if (profile?.preferencia_inicial === "gestor") {
    redirect("/painel")
  }
  if (profile?.preferencia_inicial === "pessoal") {
    const { data: pessoal } = await supabase
      .from("subcontas")
      .select("id")
      .eq("tipo", "pessoal")
      .eq("gestor_id", usuario.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
    if (pessoal) redirect(`/${pessoal.id}/controle-anual`)
    // pessoal removida → deixa o usuário reescolher abaixo.
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
        <span className="text-xl font-bold text-primary">Noviq</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Como você vai usar a Noviq?
            </h1>
            <p className="text-muted-foreground">
              Escolha como quer começar — dá para mudar isso depois.
            </p>
          </div>
          <OnboardingChooser />
        </div>
      </main>
    </div>
  )
}
