/**
 * Tipos compartilhados para o módulo financeiro.
 *
 * Centraliza definições de tipos usados em múltiplos componentes
 * para evitar duplicação e inconsistências.
 */

/**
 * TotaisData representa os valores totais de renda e despesas.
 * Usado tanto para valores planejados quanto realizados.
 */
export interface TotaisData {
  /** Renda total do período */
  renda: number
  /** Total de despesas fixas */
  fixas: number
  /** Total de despesas variáveis */
  variaveis: number
  /** Total de investimentos (aporte) */
  investimento: number
}

/**
 * SaldosData contém os totais planejados e realizados.
 */
export interface SaldosData {
  /** Totais planejados */
  planejado: TotaisData
  /** Totais realizados */
  realizado: TotaisData
}

/**
 * Alias para SaldosData.
 * Usado para consistência na nomenclatura entre componentes.
 */
export type ResumoData = SaldosData

/**
 * Objetivo financeiro com metas de acumulação.
 */
export interface Objetivo {
  id: string
  nome: string
  valorAlvo: number
  dataConclusao: string
  valorAcumulado: number
  valorInicial?: number
}

/**
 * Status do objetivo quanto ao prazo.
 */
export type StatusObjetivo = "no_prazo" | "atrasado"

/**
 * Cliente do educador financeiro.
 */
export interface Cliente {
  id: string
  nome: string
  email: string
  ultimoAcesso: string
  status: "ativo" | "inativo"
}

/**
 * Investimento financeiro.
 */
export interface Investimento {
  id: string
  tipo: string
  instituicao: string
  categoria: TipoInvestimento
  valorAplicado: number
  rentabilidade: number
  finalidade: FinalidadeInvestimento
}

/**
 * Tipo de investimento.
 */
export type TipoInvestimento = "Renda Fixa" | "Multimercado" | "Renda Variável"

/**
 * Finalidade do investimento.
 */
export type FinalidadeInvestimento = "Reserva" | "Patrimônio"
