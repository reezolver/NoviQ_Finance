import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Activity,
  ArrowRight,
  ClipboardList,
  GraduationCap,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ContaPessoalButton } from "@/components/painel/ContaPessoalButton"
import { StatCard, StatGrid } from "@/components/painel/MetricasDashboard"
import {
  NovosUsuariosChart,
  type NovosUsuariosChartData,
} from "@/components/painel/NovosUsuariosChart"

export const metadata = {
  title: "Visão geral · Noviq Finance",
}

const DIA_MS = 86_400_000

/** Rótulo curto de mês/ano (ex.: "jan/26") para o eixo do gráfico. */
function rotuloMes(d: Date): string {
  return d
    .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    .replace(".", "")
}

/** Constrói os buckets dos últimos `n` meses (mais antigo → atual). */
function ultimosMeses(n: number): { chave: string; rotulo: string }[] {
  const hoje = new Date()
  const meses: { chave: string; rotulo: string }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    meses.push({ chave: `${d.getFullYear()}-${d.getMonth()}`, rotulo: rotuloMes(d) })
  }
  return meses
}

/**
 * **Visão geral** (dashboard de gestão) — substitui o antigo "painel de gestão"
 * que empilhava clientes/leads/anamneses (essas viraram rotas próprias sob
 * `/painel/*`). Aqui ficam **métricas** úteis ao master como operador e como dev
 * acompanhando a plataforma.
 *
 * O master vê números de toda a plataforma (profiles/subcontas/anamneses via RLS
 * de master + `last_sign_in_at` via admin). O educador vê uma versão reduzida da
 * própria operação (carteira + anamneses), tudo escopado pela RLS.
 */
export default async function PainelPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")

  const isMaster = usuario.tipo_perfil === "master"
  const supabase = await createSupabaseServerClient()
  const agora = Date.now()

  // Conta pessoal do gestor (atalho do header).
  const { data: pessoal } = await supabase
    .from("subcontas")
    .select("id")
    .eq("tipo", "pessoal")
    .eq("gestor_id", usuario.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  // Dados base, escopados pela RLS (master → tudo; educador → o dele).
  const [{ data: profilesData }, { data: subcontasData }, { data: anamnesesData }] =
    await Promise.all([
      supabase.from("profiles").select("id, tipo_perfil, preferencia_inicial, created_at"),
      supabase
        .from("subcontas")
        .select("id, tipo, gestor_id, deleted_at")
        .eq("tipo", "cliente"),
      supabase.from("anamneses").select("id, status, subconta_id"),
    ])

  const profiles = profilesData ?? []
  const clientes = subcontasData ?? []
  const anamneses = anamnesesData ?? []

  // ── Métricas de clientes (comuns) ──────────────────────────────────────────
  const clientesAtivos = clientes.filter((c) => !c.deleted_at)
  const meusClientes = clientesAtivos.filter(
    (c) => c.gestor_id === usuario.id
  ).length
  const outrosClientes = clientesAtivos.filter(
    (c) => c.gestor_id !== usuario.id && c.gestor_id !== null
  ).length
  const poolClientes = clientesAtivos.filter((c) => c.gestor_id === null).length
  const naLixeira = clientes.filter((c) => c.deleted_at !== null).length

  // ── Métricas de anamnese (comuns) ──────────────────────────────────────────
  const anamnesesTotal = anamneses.length
  const convertidas = anamneses.filter((a) => a.subconta_id !== null).length
  const preenchidas = anamneses.filter(
    (a) => a.status === "preenchida" && a.subconta_id === null
  ).length
  const enviadas = anamneses.filter(
    (a) => a.status === "enviada" && a.subconta_id === null
  ).length
  const taxaConversao =
    anamnesesTotal > 0 ? Math.round((convertidas / anamnesesTotal) * 100) : 0

  // ── Métricas só-master (usuários/atividade) ────────────────────────────────
  const usuariosTotal = profiles.length
  const novos7d = profiles.filter(
    (p) => agora - new Date(p.created_at).getTime() <= 7 * DIA_MS
  ).length
  const novos30d = profiles.filter(
    (p) => agora - new Date(p.created_at).getTime() <= 30 * DIA_MS
  ).length
  const educadoresTotal = profiles.filter(
    (p) => p.tipo_perfil === "educador"
  ).length
  const leadsTotal = profiles.filter(
    (p) => p.tipo_perfil === "educador" && p.preferencia_inicial === "pessoal"
  ).length

  // Ativos nos últimos 30 dias (via `last_sign_in_at`, admin). Best-effort: se
  // falhar, mostra "—" em vez de quebrar o dashboard.
  let ativos30d: number | null = null
  if (isMaster) {
    try {
      const admin = createSupabaseAdminClient()
      const { data: lista } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })
      ativos30d = (lista?.users ?? []).filter((u) => {
        if (!u.last_sign_in_at) return false
        return agora - new Date(u.last_sign_in_at).getTime() <= 30 * DIA_MS
      }).length
    } catch {
      ativos30d = null
    }
  }

  // Gráfico: novos cadastros por mês (6 meses), educadores × clientes.
  const meses = ultimosMeses(6)
  const indicePorChave = new Map(meses.map((m, i) => [m.chave, i]))
  const chartData: NovosUsuariosChartData[] = meses.map((m) => ({
    mes: m.rotulo,
    educadores: 0,
    clientes: 0,
  }))
  for (const p of profiles) {
    const d = new Date(p.created_at)
    const idx = indicePorChave.get(`${d.getFullYear()}-${d.getMonth()}`)
    if (idx === undefined) continue
    if (p.tipo_perfil === "educador" || p.tipo_perfil === "master") {
      chartData[idx].educadores += 1
    } else if (p.tipo_perfil === "cliente") {
      chartData[idx].clientes += 1
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
            <p className="text-sm text-muted-foreground">
              {isMaster
                ? "Panorama da plataforma — usuários, carteiras e anamneses."
                : "Panorama da sua operação — carteira e anamneses."}
            </p>
          </div>
          <ContaPessoalButton pessoalId={pessoal?.id ?? null} />
        </div>

        {isMaster ? (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Usuários
              </h2>
              <StatGrid>
                <StatCard
                  titulo="Total de usuários"
                  valor={usuariosTotal}
                  dica={`+${novos7d} nos últimos 7 dias`}
                  icone={Users}
                />
                <StatCard
                  titulo="Novos (30 dias)"
                  valor={novos30d}
                  dica="Cadastros no período"
                  icone={UserPlus}
                />
                <StatCard
                  titulo="Ativos (30 dias)"
                  valor={ativos30d ?? "—"}
                  dica="Com login recente"
                  icone={Activity}
                />
                <StatCard
                  titulo="Educadores"
                  valor={educadoresTotal}
                  dica={`${leadsTotal} em modo pessoal (leads)`}
                  icone={GraduationCap}
                />
              </StatGrid>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Clientes
              </h2>
              <StatGrid>
                <StatCard
                  titulo="Clientes ativos"
                  valor={clientesAtivos.length}
                  dica={`${naLixeira} na lixeira`}
                  icone={Users}
                />
                <StatCard
                  titulo="Ligados a você"
                  valor={meusClientes}
                  dica="Você é o gestor direto"
                  icone={UserCheck}
                />
                <StatCard
                  titulo="De outros gestores"
                  valor={outrosClientes}
                  dica="Geridos por educadores"
                  icone={GraduationCap}
                />
                <StatCard
                  titulo="Não atribuídos"
                  valor={poolClientes}
                  dica="No pool, aguardando gestor"
                  icone={UserPlus}
                />
              </StatGrid>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Anamneses
              </h2>
              <StatGrid>
                <StatCard
                  titulo="Total"
                  valor={anamnesesTotal}
                  icone={ClipboardList}
                />
                <StatCard titulo="Enviadas (pendentes)" valor={enviadas} />
                <StatCard titulo="Preenchidas" valor={preenchidas} />
                <StatCard
                  titulo="Convertidas"
                  valor={convertidas}
                  dica={`${taxaConversao}% de conversão`}
                />
              </StatGrid>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Novos usuários por mês</CardTitle>
                <CardDescription>
                  Cadastros dos últimos 6 meses — educadores × clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NovosUsuariosChart data={chartData} />
              </CardContent>
            </Card>
          </>
        ) : (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Sua operação
            </h2>
            <StatGrid>
              <StatCard
                titulo="Seus clientes"
                valor={meusClientes}
                dica={`${naLixeira} na lixeira`}
                icone={Users}
              />
              <StatCard
                titulo="Anamneses"
                valor={anamnesesTotal}
                dica={`${enviadas} pendentes`}
                icone={ClipboardList}
              />
              <StatCard
                titulo="Preenchidas"
                valor={preenchidas}
                icone={UserCheck}
              />
              <StatCard
                titulo="Convertidas"
                valor={convertidas}
                dica={`${taxaConversao}% de conversão`}
                icone={UserPlus}
              />
            </StatGrid>
          </section>
        )}

        <Card>
          <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Atalhos</p>
              <p className="text-sm text-muted-foreground">
                Gerencie clientes e anamneses nas abas ao lado.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/painel/clientes">
                  Clientes
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/painel/anamneses">
                  Anamneses
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
