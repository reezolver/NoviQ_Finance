import { Tags } from "lucide-react"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CategoriaModal } from "@/components/categorias/CategoriaModal"
import { CategoriaRowActions } from "@/components/categorias/CategoriaRowActions"
import {
  GRUPO_LABEL,
  GRUPOS_TODOS,
  type GrupoCategoria,
} from "@/components/categorias/grupos"

/**
 * Categorias — gerenciamento das categorias da subconta. O grupo de cada
 * categoria (`Fixa` · `Variável` · `Investimento` para despesa; `Renda` para
 * receita) é o que classifica seus lançamentos, já que a despesa não guarda
 * Fixa/Variável por conta própria.
 *
 * Server Component: busca as categorias (RLS-enforced) e agrupa por grupo. As
 * ações de criar/editar/remover ficam em componentes client.
 */

interface CategoriaRow {
  id: string
  nome: string
  grupo: GrupoCategoria
  ordem: number
}

/** Texto de apoio por grupo, mostrado abaixo do título de cada bloco. */
const GRUPO_AJUDA: Record<GrupoCategoria, string> = {
  fixa: "Despesas que se repetem todo mês (aluguel, internet…).",
  variavel: "Despesas que oscilam (alimentação, lazer, transporte…).",
  investimento: "Aportes e aplicações tratados como saída.",
  renda: "Fontes de receita (salário, freelance…).",
}

export default async function CategoriasPage({
  params,
}: {
  params: Promise<{ subcontaId: string }>
}) {
  const { subcontaId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: categoriasData } = await supabase
    .from("categorias")
    .select("id, nome, grupo, ordem")
    .eq("subconta_id", subcontaId)
    .order("ordem")

  const categorias = (categoriasData ?? []) as unknown as CategoriaRow[]

  const porGrupo = new Map<GrupoCategoria, CategoriaRow[]>(
    GRUPOS_TODOS.map((g) => [g, []])
  )
  for (const c of categorias) {
    porGrupo.get(c.grupo)?.push(c)
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
      {/* Cabeçalho + ação */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Organize suas despesas e receitas. O grupo define se a despesa é Fixa,
            Variável ou Investimento.
          </p>
        </div>
        <CategoriaModal subcontaId={subcontaId} />
      </div>

      {/* Um bloco por grupo */}
      <div className="space-y-4">
        {GRUPOS_TODOS.map((grupo) => {
          const itens = porGrupo.get(grupo) ?? []
          return (
            <Card key={grupo}>
              <CardHeader>
                <CardTitle className="text-base">{GRUPO_LABEL[grupo]}</CardTitle>
                <CardDescription>{GRUPO_AJUDA[grupo]}</CardDescription>
              </CardHeader>
              <CardContent>
                {itens.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    Nenhuma categoria neste grupo ainda.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {itens.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-2 py-2"
                      >
                        <span className="text-sm text-foreground">{c.nome}</span>
                        <CategoriaRowActions
                          subcontaId={subcontaId}
                          categoria={{ id: c.id, nome: c.nome, grupo: c.grupo }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Estado totalmente vazio (subconta sem nenhuma categoria) */}
      {categorias.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Tags className="size-8 text-muted-foreground" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Nenhuma categoria ainda</p>
            <p className="text-sm text-muted-foreground">
              Crie sua primeira categoria para começar a classificar os lançamentos.
            </p>
          </div>
          <CategoriaModal subcontaId={subcontaId} />
        </div>
      )}
    </div>
  )
}
