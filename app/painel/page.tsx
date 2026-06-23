import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Trash2, UserX, Users } from "lucide-react"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CriarClienteModal } from "@/components/painel/CriarClienteModal"
import { ContaPessoalButton } from "@/components/painel/ContaPessoalButton"
import {
  ClienteRowActions,
  type EducadorOpcao,
} from "@/components/painel/ClienteRowActions"
import {
  PoolClienteActions,
  type GestorDestino,
} from "@/components/painel/PoolClienteActions"
import { RestaurarClienteButton } from "@/components/painel/RestaurarClienteButton"
import { EnviarAnamneseModal } from "@/components/anamnese/EnviarAnamneseModal"
import {
  AnamnesesPanel,
  type AnamneseResumo,
} from "@/components/anamnese/AnamnesesPanel"
import { LeadsPanel, type LeadResumo } from "@/components/painel/LeadsPanel"
import type { AnaliseAnamnese } from "@/lib/anamnese"

/** Janela de retenção da lixeira antes da purga automática (Spec 21 · RF-5c.4). */
const RETENCAO_DIAS = 90

/** Dias restantes até a purga: 90 − dias decorridos desde `deleted_at` (≥ 0). */
function diasParaPurga(deletedAt: string): number {
  const decorridos = Math.floor(
    (Date.now() - new Date(deletedAt).getTime()) / 86_400_000
  )
  return Math.max(0, RETENCAO_DIAS - decorridos)
}

/**
 * Painel de gestão (Spec 07 + Spec 21) — porta de entrada do **gestor**
 * (educador/master): carteira de clientes + onboarding + conta pessoal, mais o
 * **pool de não atribuídos** (master) e a **lixeira** (90 dias).
 *
 * Toda decisão de acesso vive na RLS: a query de `subcontas` já devolve só o que
 * o gestor pode ver (educador → a própria carteira, incluindo a própria lixeira;
 * master → clientes de qualquer educador + órfãos, nunca a `pessoal` alheia).
 */
export default async function PainelPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")

  const isMaster = usuario.tipo_perfil === "master"
  const supabase = await createSupabaseServerClient()

  const [
    { data: clientesData },
    { data: pessoal },
    { data: anamnesesData },
  ] = await Promise.all([
    supabase
      .from("subcontas")
      .select("id, nome, gestor_id, deleted_at, created_at")
      .eq("tipo", "cliente")
      .order("nome", { ascending: true }),
    supabase
      .from("subcontas")
      .select("id")
      .eq("tipo", "pessoal")
      .eq("gestor_id", usuario.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("anamneses")
      .select(
        "id, nome_lead, email_lead, status, token, subconta_id, created_at, preenchida_at, analise"
      )
      .order("created_at", { ascending: false }),
  ])

  const clientes = clientesData ?? []
  // Particiona: ativos atribuídos · pool (sem gestor) · lixeira (deleted_at).
  const ativos = clientes.filter((c) => !c.deleted_at && c.gestor_id !== null)
  const naoAtribuidos = clientes.filter(
    (c) => !c.deleted_at && c.gestor_id === null
  )
  const lixeira = clientes.filter((c) => c.deleted_at !== null)

  const anamneses: AnamneseResumo[] = (anamnesesData ?? []).map((a) => ({
    id: a.id,
    nome_lead: a.nome_lead,
    email_lead: a.email_lead,
    status: a.status,
    token: a.token,
    subconta_id: a.subconta_id,
    created_at: a.created_at,
    preenchida_at: a.preenchida_at,
    analise: (a.analise as AnaliseAnamnese | null) ?? null,
  }))

  // Leads (RF-10): só o master enxerga educadores em modo pessoal.
  let leads: LeadResumo[] = []
  if (isMaster) {
    const { data: leadsData } = await supabase
      .from("profiles")
      .select("id, nome, email, created_at")
      .eq("tipo_perfil", "educador")
      .eq("preferencia_inicial", "pessoal")
      .order("created_at", { ascending: false })
    leads = leadsData ?? []
  }

  // Só o master enxerga os gestores (privacidade via RLS): nomes para a coluna
  // "Gestor" + opções de destino do "mover"/"assumir".
  const gestorNomePorId = new Map<string, string>()
  let educadores: EducadorOpcao[] = []
  if (isMaster && clientes.length > 0) {
    const gestorIds = [
      ...new Set(
        clientes.map((c) => c.gestor_id).filter((id): id is string => id !== null)
      ),
    ]
    const { data: educadoresData } = await supabase
      .from("profiles")
      .select("id, nome, email")
      .eq("tipo_perfil", "educador")
    educadores = (educadoresData ?? []).map((e) => ({
      id: e.id,
      nome: e.nome?.trim() || e.email || "Sem nome",
    }))

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

  // Destinos do "Assumir" do pool: o próprio master + os educadores.
  const destinosPool: GestorDestino[] = [
    { id: usuario.id, nome: "Você (master)" },
    ...educadores,
  ]

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Painel de gestão
            </h1>
            <p className="text-sm text-muted-foreground">
              {isMaster
                ? "Clientes de todos os educadores. Entre numa carteira para lançar e acompanhar."
                : "Sua carteira de clientes. Entre numa carteira para lançar e acompanhar."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ContaPessoalButton pessoalId={pessoal?.id ?? null} />
            <EnviarAnamneseModal />
            <CriarClienteModal limiteAtingido={ativos.length >= 3} />
          </div>
        </div>

        {ativos.length === 0 ? (
          <Card>
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="size-6 text-primary" />
              </div>
              <CardTitle>Nenhum cliente ainda</CardTitle>
              <CardDescription className="max-w-md">
                Crie a primeira conta de cliente para começar a acompanhar as
                finanças dele — ou envie uma anamnese para captar um novo lead.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-center gap-2">
              <CriarClienteModal />
              <EnviarAnamneseModal />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Clientes ({ativos.length})
              </CardTitle>
              <CardDescription>
                Clique em “Entrar” para abrir a carteira do cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    {isMaster && <TableHead>Gestor</TableHead>}
                    <TableHead className="w-px text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ativos.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        {cliente.nome}
                      </TableCell>
                      {isMaster && (
                        <TableCell className="text-muted-foreground">
                          {cliente.gestor_id
                            ? gestorNomePorId.get(cliente.gestor_id) ?? "—"
                            : "Não atribuído"}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/${cliente.id}/controle-anual`}>
                              Entrar
                              <ArrowRight />
                            </Link>
                          </Button>
                          <ClienteRowActions
                            subcontaId={cliente.id}
                            nomeAtual={cliente.nome}
                            gestorAtualId={cliente.gestor_id}
                            isMaster={isMaster}
                            educadores={educadores}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {isMaster && naoAtribuidos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserX className="size-4 text-muted-foreground" />
                Não atribuídos ({naoAtribuidos.length})
              </CardTitle>
              <CardDescription>
                Clientes cujo gestor foi removido. Assuma um cliente para
                atribuí-lo a você ou a outro educador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {naoAtribuidos.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        {cliente.nome}
                      </TableCell>
                      <TableCell className="text-right">
                        <PoolClienteActions
                          subcontaId={cliente.id}
                          destinos={destinosPool}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {lixeira.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trash2 className="size-4 text-muted-foreground" />
                Lixeira ({lixeira.length})
              </CardTitle>
              <CardDescription>
                Clientes excluídos temporariamente. Restaure dentro de{" "}
                {RETENCAO_DIAS} dias — depois disso são apagados para sempre.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {lixeira.map((cliente) => {
                    const dias = diasParaPurga(cliente.deleted_at as string)
                    return (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">
                          {cliente.nome}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={dias <= 7 ? "destructive" : "secondary"}
                          >
                            {dias === 0
                              ? "apaga em breve"
                              : `apaga em ${dias} ${dias === 1 ? "dia" : "dias"}`}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <RestaurarClienteButton subcontaId={cliente.id} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {isMaster && <LeadsPanel leads={leads} />}

        <AnamnesesPanel anamneses={anamneses} />
      </div>
    </main>
  )
}
