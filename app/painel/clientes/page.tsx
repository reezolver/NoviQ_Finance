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

export const metadata = {
  title: "Clientes · Noviq Finance",
}

/** Janela de retenção da lixeira antes da purga automática (Spec 21 · RF-5c.4). */
const RETENCAO_DIAS = 90

/** Dias restantes até a purga: 90 − dias decorridos desde `deleted_at` (≥ 0). */
function diasParaPurga(deletedAt: string): number {
  const decorridos = Math.floor(
    (Date.now() - new Date(deletedAt).getTime()) / 86_400_000
  )
  return Math.max(0, RETENCAO_DIAS - decorridos)
}

/** Linha de cliente reusável: nome + (Gestor, no master) + Entrar + ações. */
function LinhaCliente({
  cliente,
  isMaster,
  gestorNome,
  educadores,
}: {
  cliente: {
    id: string
    nome: string
    gestor_id: string | null
  }
  isMaster: boolean
  gestorNome?: string
  educadores: EducadorOpcao[]
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{cliente.nome}</TableCell>
      {isMaster && (
        <TableCell className="text-muted-foreground">
          {cliente.gestor_id ? gestorNome ?? "—" : "Não atribuído"}
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
  )
}

/**
 * **Clientes** (reestruturação do painel master) — extraída do antigo
 * `painel/page.tsx`. Agora a carteira tem rota própria sob `/painel/clientes`.
 *
 * O master vê os clientes particionados em **ligados a você** (gestor_id = id do
 * master) vs **de outros gestores**, além do **pool de não atribuídos** e da
 * **lixeira** (90 dias). O educador vê só a própria carteira + a lixeira.
 *
 * Toda decisão de acesso vive na RLS: a query de `subcontas` já devolve só o que
 * o gestor pode ver (educador → a própria carteira; master → clientes de
 * qualquer educador + órfãos, nunca a `pessoal` alheia).
 */
export default async function ClientesPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")

  const isMaster = usuario.tipo_perfil === "master"
  const supabase = await createSupabaseServerClient()

  const [{ data: clientesData }, { data: pessoal }] = await Promise.all([
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
  ])

  const clientes = clientesData ?? []
  const ativos = clientes.filter((c) => !c.deleted_at && c.gestor_id !== null)
  const naoAtribuidos = clientes.filter(
    (c) => !c.deleted_at && c.gestor_id === null
  )
  const lixeira = clientes.filter((c) => c.deleted_at !== null)

  // Particiona os ativos: do master vs de outros gestores (só importa ao master).
  const meus = ativos.filter((c) => c.gestor_id === usuario.id)
  const deOutros = ativos.filter((c) => c.gestor_id !== usuario.id)

  // Só o master enxerga os gestores (privacidade via RLS): nomes para a coluna
  // "Gestor" + opções de destino do "mover"/"assumir".
  const gestorNomePorId = new Map<string, string>()
  let educadores: EducadorOpcao[] = []
  if (isMaster) {
    const { data: educadoresData } = await supabase
      .from("profiles")
      .select("id, nome, email")
      .eq("tipo_perfil", "educador")
    educadores = (educadoresData ?? []).map((e) => ({
      id: e.id,
      nome: e.nome?.trim() || e.email || "Sem nome",
    }))

    const gestorIds = [
      ...new Set(
        ativos
          .map((c) => c.gestor_id)
          .filter((id): id is string => id !== null)
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

  // Destinos do "Assumir" do pool: o próprio master + os educadores.
  const destinosPool: GestorDestino[] = [
    { id: usuario.id, nome: "Você (master)" },
    ...educadores,
  ]

  const totalAtivos = ativos.length

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground">
              {isMaster
                ? "Clientes de todos os educadores. Entre numa carteira para lançar e acompanhar."
                : "Sua carteira de clientes. Entre numa carteira para lançar e acompanhar."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ContaPessoalButton pessoalId={pessoal?.id ?? null} />
            <CriarClienteModal limiteAtingido={meus.length >= 3} />
          </div>
        </div>

        {totalAtivos === 0 ? (
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
            </CardContent>
          </Card>
        ) : isMaster ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Ligados a você ({meus.length})
                </CardTitle>
                <CardDescription>
                  Clientes em que você é o gestor direto.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meus.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Você não é gestor direto de nenhum cliente.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Gestor</TableHead>
                        <TableHead className="w-px text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meus.map((cliente) => (
                        <LinhaCliente
                          key={cliente.id}
                          cliente={cliente}
                          isMaster
                          gestorNome={
                            cliente.gestor_id
                              ? gestorNomePorId.get(cliente.gestor_id)
                              : undefined
                          }
                          educadores={educadores}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  De outros gestores ({deOutros.length})
                </CardTitle>
                <CardDescription>
                  Clientes geridos pelos educadores da plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deOutros.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nenhum cliente de outros gestores.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Gestor</TableHead>
                        <TableHead className="w-px text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deOutros.map((cliente) => (
                        <LinhaCliente
                          key={cliente.id}
                          cliente={cliente}
                          isMaster
                          gestorNome={
                            cliente.gestor_id
                              ? gestorNomePorId.get(cliente.gestor_id)
                              : undefined
                          }
                          educadores={educadores}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Seus clientes ({meus.length})
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
                    <TableHead className="w-px text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meus.map((cliente) => (
                    <LinhaCliente
                      key={cliente.id}
                      cliente={cliente}
                      isMaster={false}
                      educadores={educadores}
                    />
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
      </div>
    </main>
  )
}
