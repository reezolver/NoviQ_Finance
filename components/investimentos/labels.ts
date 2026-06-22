import type { Database } from "@/types/database"

/** Tipos canônicos dos enums do banco (Spec 00, Bloco 8). */
export type TipoPatrimonio = Database["public"]["Enums"]["tipo_patrimonio"]
export type CategoriaInvestimento =
  Database["public"]["Enums"]["categoria_investimento"]
export type FinalidadePatrimonio =
  Database["public"]["Enums"]["finalidade_patrimonio"]

/** Rótulos legíveis (PT-BR) para os enums — usados em selects, tabelas e gráfico. */
export const TIPO_PATRIMONIO_LABEL: Record<TipoPatrimonio, string> = {
  imovel: "Imóvel",
  veiculo: "Veículo",
  investimento: "Investimento",
}

export const CATEGORIA_INVESTIMENTO_LABEL: Record<CategoriaInvestimento, string> = {
  renda_fixa: "Renda Fixa",
  renda_variavel: "Renda Variável",
  multimercado: "Multimercado",
}

export const FINALIDADE_LABEL: Record<FinalidadePatrimonio, string> = {
  reserva: "Reserva",
  patrimonio: "Patrimônio",
}

/** Ordem estável das categorias (gráfico + legenda). */
export const CATEGORIAS_INVESTIMENTO: CategoriaInvestimento[] = [
  "renda_fixa",
  "renda_variavel",
  "multimercado",
]

/** Cor de cada categoria via tokens do design system (válido em dark + light). */
export const CATEGORIA_INVESTIMENTO_COR: Record<CategoriaInvestimento, string> = {
  renda_fixa: "var(--color-chart-1)",
  renda_variavel: "var(--color-chart-2)",
  multimercado: "var(--color-chart-3)",
}
