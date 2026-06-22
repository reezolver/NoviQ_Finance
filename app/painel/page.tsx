import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Users } from "lucide-react"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
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
import { EnviarAnamneseModal } from "@/components/anamnese/EnviarAnamneseModal"
import {
  AnamnesesPanel,
  type AnamneseResumo,
} from "@/components/anamnese/AnamnesesPanel"
import type { AnaliseAnamnese } from "@/lib/anamnese"

/**
 * Painel de gestão (Spec 07) — porta de entrada do **gestor** (educador/master):
 * lista da carteira de clientes + onboarding + acesso à conta pessoal.
 *
 * Toda decisão de acesso vive na RLS: a query de `subcontas` já devolve só o que
 * o gestor pode ver (educador → a própria carteira; master → clientes de
 * qualquer educador, nunca a `pessoal` alheia). O frontend só exibe o resultado.
 */
export default async function PainelPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")

  const isMaster = usuario.tipo_perfil === "master"
  const supabase = await createSupabaseServerClient()

  // Carteira de clientes + conta pessoal + nome do perfil + anamneses do gestor.
  // A RLS de `anamneses` (`gestor_id = auth.uid()`) já filtra: master não vê as
  // alheias (decisão #7), só as que ele mesmo enviou.
  const [
    { data: clientesData },
    { data: pessoal },
    { data: profile },
    { data: anamnesesData },
  ] = await Promise.all([
    supabase
      .from("subcontas")
      .select("id, nome, gestor_id, created_at")
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
    supabase.from("profiles").select("nome").eq("id", usuario.id).maybeSingle(),
    supabase
      .from("anamneses")
      .select(
        "id, nome_lead, email_lead, status, token, subconta_id, created_at, preenchida_at, analise"
      )
      .order("created_at", { ascending: false }),
  ])

  const clientes = clientesData ?? []
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
  const nomeGestor = profile?.nome?.trim() || "Minha conta"

  // Só o master enxerga os gestores (privacidade via RLS): nomes para a coluna
  // "Gestor" + opções de destino do "mover cliente".
  const gestorNomePorId = new Map<string, string>()
  let educadores: EducadorOpcao[] = []
  if (isMaster && clientes.length > 0) {
    const gestorIds = [...new Set(clientes.map((c) => c.gestor_id))]
    const [{ data: gestoresData }, { data: educadoresData }] = await Promise.all([
      supabase.from("profiles").select("id, nome, email").in("id", gestorIds),
      supabase
        .from("profiles")
        .select("id, nome, email")
        .eq("tipo_perfil", "educador"),
    ])
    for (const g of gestoresData ?? []) {
      gestorNomePorId.set(g.id, g.nome?.trim() || g.email || "Sem nome")
    }
    educadores = (educadoresData ?? []).map((e) => ({
      id: e.id,
      nome: e.nome?.trim() || e.email || "Sem nome",
    }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <Link
          href="/"
          className="text-xl font-bold text-primary"
          aria-label="Início"
        >
          Noviq
        </Link>
        <ThemeToggle />
      </header>

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
              <ContaPessoalButton
                pessoalId={pessoal?.id ?? null}
                nomeSugerido={nomeGestor}
              />
              <EnviarAnamneseModal />
              <CriarClienteModal />
            </div>
          </div>

          {clientes.length === 0 ? (
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
                  Clientes ({clientes.length})
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
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">
                          {cliente.nome}
                        </TableCell>
                        {isMaster && (
                          <TableCell className="text-muted-foreground">
                            {gestorNomePorId.get(cliente.gestor_id) ?? "—"}
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
                            {isMaster && (
                              <ClienteRowActions
                                subcontaId={cliente.id}
                                gestorAtualId={cliente.gestor_id}
                                educadores={educadores}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <AnamnesesPanel anamneses={anamneses} />
        </div>
      </main>
    </div>
  )
}
