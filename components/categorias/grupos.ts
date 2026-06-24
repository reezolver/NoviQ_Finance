import type { Database } from "@/types/database"

export type GrupoCategoria = Database["public"]["Enums"]["grupo_categoria"]

/** Rótulo curto de cada grupo de categoria, para selects e badges. */
export const GRUPO_LABEL: Record<GrupoCategoria, string> = {
  fixa: "Fixa",
  variavel: "Variável",
  investimento: "Investimento",
  renda: "Renda",
}

/** Grupos de uma **despesa** (os que aparecem na aba Despesa do lançamento). */
export const GRUPOS_DESPESA: ReadonlyArray<GrupoCategoria> = [
  "fixa",
  "variavel",
  "investimento",
]

/** Todos os grupos, na ordem usada na tela de categorias e no select de criação. */
export const GRUPOS_TODOS: ReadonlyArray<GrupoCategoria> = [
  "fixa",
  "variavel",
  "investimento",
  "renda",
]
