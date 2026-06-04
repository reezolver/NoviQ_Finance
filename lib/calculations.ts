/**
 * Funções de cálculo financeiro da plataforma Noviq.
 * Todas as fórmulas financeiras devem ficar aqui.
 * Nunca escrever cálculos inline nos componentes.
 */

/**
 * Calcula a diferença entre valor realizado e planejado.
 * @param realizado - Valor efetivamente realizado
 * @param planejado - Valor que foi planejado
 * @returns Diferença (pode ser negativa)
 */
export function calcularDiferenca(realizado: number, planejado: number): number {
  return realizado - planejado
}

/**
 * Formata um valor numérico para moeda brasileira (BRL).
 * @param valor - Valor a ser formatado
 * @returns String formatada (ex: "R$ 7.500,00")
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/**
 * Calcula o saldo final (renda - despesas).
 * @param renda - Total de renda
 * @param despesasFixas - Total de despesas fixas
 * @param despesasVariaveis - Total de despesas variáveis
 * @returns Saldo final
 */
export function calcularSaldoFinal(
  renda: number,
  despesasFixas: number,
  despesasVariaveis: number
): number {
  return renda - despesasFixas - despesasVariaveis
}

/**
 * Calcula o progresso percentual de um objetivo.
 * @param valorAcumulado - Valor já acumulado
 * @param valorAlvo - Valor alvo do objetivo
 * @returns Progresso em porcentagem (0-100)
 */
export function calcularProgressoObjetivo(valorAcumulado: number, valorAlvo: number): number {
  if (valorAlvo === 0) return 0
  return (valorAcumulado / valorAlvo) * 100
}

/**
 * Calcula o valor necessário mensal para atingir um objetivo.
 * @param valorAlvo - Valor alvo do objetivo
 * @param valorAcumulado - Valor já acumulado
 * @param mesesRestantes - Número de meses restantes
 * @returns Valor necessário por mês
 */
export function calcularNecessarioMensal(
  valorAlvo: number,
  valorAcumulado: number,
  mesesRestantes: number
): number {
  if (mesesRestantes <= 0) return 0
  return (valorAlvo - valorAcumulado) / mesesRestantes
}

// ─── Tipos para distribuição 50-30-20 ─────────────────────────────────────────────

export interface Distribuicao503020 {
  fixo: number
  variavel: number
  investimento: number
}

export interface Percentual503020 {
  fixo: number
  variavel: number
  investimento: number
}

/**
 * Calcula a distribuição ideal 50-30-20 sobre a renda.
 * @param rendaTotal - Renda total calculada
 * @returns Objeto com valores ideais (50% fixo, 30% variável, 20% investimento)
 */
export function calcularDistribuicao503020(rendaTotal: number): Distribuicao503020 {
  return {
    fixo: rendaTotal * 0.5,
    variavel: rendaTotal * 0.3,
    investimento: rendaTotal * 0.2,
  }
}

/**
 * Calcula o percentual que cada categoria representa sobre a renda.
 * @param categoria - Valor da categoria (fixo, variável ou investimento)
 * @param rendaTotal - Renda total
 * @returns Percentual (0-100)
 */
export function calcularPercentual(categoria: number, rendaTotal: number): number {
  if (rendaTotal === 0) return 0
  return (categoria / rendaTotal) * 100
}
