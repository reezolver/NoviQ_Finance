import { redirect } from "next/navigation"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { LeadsPanel, type LeadResumo } from "@/components/painel/LeadsPanel"

export const metadata = {
  title: "Leads · Noviq Finance",
}

/**
 * **Leads** (reestruturação do painel master) — rota própria sob `/painel/leads`,
 * **só master** (Spec 17 · RF-10). Lista educadores que entraram em modo pessoal
 * (`tipo_perfil='educador'` + `preferencia_inicial='pessoal'`). Privacidade
 * (§11.6): só o perfil (nome/e-mail/data), nunca as finanças do lead.
 */
export default async function LeadsPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")
  if (usuario.tipo_perfil !== "master") redirect("/painel")

  const supabase = await createSupabaseServerClient()
  const { data: leadsData } = await supabase
    .from("profiles")
    .select("id, nome, email, created_at")
    .eq("tipo_perfil", "educador")
    .eq("preferencia_inicial", "pessoal")
    .order("created_at", { ascending: false })

  const leads: LeadResumo[] = leadsData ?? []

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Educadores que entraram para cuidar só das próprias finanças.
          </p>
        </div>

        <LeadsPanel leads={leads} />
      </div>
    </main>
  )
}
