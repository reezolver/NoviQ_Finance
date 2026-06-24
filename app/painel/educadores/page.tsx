import { redirect } from "next/navigation"
import { GraduationCap } from "lucide-react"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
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
import { EducadorRowActions } from "@/components/painel/EducadorRowActions"

export const metadata = {
  title: "Educadores · Noviq Finance",
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * **Educadores** (reestruturação do painel master) — rota própria sob
 * `/painel/educadores`, **só master**. Lista todos os gestores cadastrados
 * (educadores + masters) com a contagem de clientes de cada um. O master pode
 * **promover um educador a master** ou **excluí-lo** (clientes viram pool).
 *
 * Privacidade/escopo: master lê `profiles` de todos via RLS (`is_master()`).
 */
export default async function EducadoresPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")
  if (usuario.tipo_perfil !== "master") redirect("/painel")

  const supabase = await createSupabaseServerClient()

  const [{ data: gestoresData }, { data: clientesData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, email, tipo_perfil, status, created_at")
      .in("tipo_perfil", ["educador", "master"])
      .order("tipo_perfil", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("subcontas")
      .select("gestor_id")
      .eq("tipo", "cliente")
      .is("deleted_at", null),
  ])

  const gestores = gestoresData ?? []

  // Conta clientes ativos por gestor.
  const clientesPorGestor = new Map<string, number>()
  for (const c of clientesData ?? []) {
    if (c.gestor_id) {
      clientesPorGestor.set(
        c.gestor_id,
        (clientesPorGestor.get(c.gestor_id) ?? 0) + 1
      )
    }
  }

  const educadores = gestores.filter((g) => g.tipo_perfil === "educador")

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Educadores</h1>
          <p className="text-sm text-muted-foreground">
            Todos os gestores da plataforma. Promova um educador a master ou
            exclua a conta dele.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Gestores ({gestores.length})
            </CardTitle>
            <CardDescription>
              {educadores.length} educador(es) · {gestores.length - educadores.length}{" "}
              master(s).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gestores.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <GraduationCap className="size-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhum educador cadastrado ainda.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead className="text-right">Clientes</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="w-px text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gestores.map((g) => {
                    const nome = g.nome?.trim() || g.email || "Sem nome"
                    const isEducador = g.tipo_perfil === "educador"
                    const ehVoce = g.id === usuario.id
                    const qtd = clientesPorGestor.get(g.id) ?? 0
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">
                          {nome}
                          {ehVoce ? (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (você)
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {g.email || "—"}
                        </TableCell>
                        <TableCell>
                          {isEducador ? (
                            <Badge variant="secondary">Educador</Badge>
                          ) : (
                            <Badge>Master</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {qtd}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatarData(g.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEducador ? (
                            <EducadorRowActions
                              educadorId={g.id}
                              nome={nome}
                              qtdClientes={qtd}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
