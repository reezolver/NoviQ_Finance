import { redirect } from "next/navigation"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { EnviarAnamneseModal } from "@/components/anamnese/EnviarAnamneseModal"
import {
  AnamnesesPanel,
  type AnamneseResumo,
} from "@/components/anamnese/AnamnesesPanel"
import type { AnaliseAnamnese } from "@/lib/anamnese"

export const metadata = {
  title: "Anamneses · Noviq Finance",
}

/**
 * **Anamneses** (reestruturação do painel master) — rota própria sob
 * `/painel/anamneses`. O educador vê só as suas (RLS `gestor_id = auth.uid()`);
 * o **master vê todas** (policies `anamneses: master select/delete`) com a coluna
 * "Gestor" para saber quem enviou cada uma. A exclusão (`descartarAnamnese`) é
 * permitida enquanto a anamnese não virou cliente.
 */
export default async function AnamnesesPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")

  const isMaster = usuario.tipo_perfil === "master"
  const supabase = await createSupabaseServerClient()

  const { data: anamnesesData } = await supabase
    .from("anamneses")
    .select(
      "id, nome_lead, email_lead, status, token, subconta_id, created_at, preenchida_at, analise, gestor_id"
    )
    .order("created_at", { ascending: false })

  const linhas = anamnesesData ?? []

  // Master: resolve os nomes dos gestores que enviaram (coluna "Gestor").
  const gestorNomePorId = new Map<string, string>()
  if (isMaster && linhas.length > 0) {
    const gestorIds = [
      ...new Set(
        linhas.map((a) => a.gestor_id).filter((id): id is string => id !== null)
      ),
    ]
    if (gestorIds.length > 0) {
      const { data: gestoresData } = await supabase
        .from("profiles")
        .select("id, nome, email")
        .in("id", gestorIds)
      for (const g of gestoresData ?? []) {
        gestorNomePorId.set(g.id, g.nome?.trim() || g.email || "Sem nome")
      }
    }
  }

  const anamneses: AnamneseResumo[] = linhas.map((a) => ({
    id: a.id,
    nome_lead: a.nome_lead,
    email_lead: a.email_lead,
    status: a.status,
    token: a.token,
    subconta_id: a.subconta_id,
    created_at: a.created_at,
    preenchida_at: a.preenchida_at,
    analise: (a.analise as AnaliseAnamnese | null) ?? null,
    gestor_nome: a.gestor_id ? gestorNomePorId.get(a.gestor_id) ?? null : null,
  }))

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Anamneses</h1>
            <p className="text-sm text-muted-foreground">
              {isMaster
                ? "Todas as anamneses da plataforma — criadas, enviadas, preenchidas e convertidas."
                : "Acompanhe os leads, veja o diagnóstico e converta em cliente."}
            </p>
          </div>
          <EnviarAnamneseModal />
        </div>

        <AnamnesesPanel anamneses={anamneses} mostrarGestor={isMaster} />
      </div>
    </main>
  )
}
