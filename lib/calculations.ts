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

// ─── Funções para Objetivos ───────────────────────────────────────────────────────

/**
 * Calcula o status do objetivo baseado no progresso esperado vs realizado.
 * @param valorAcumulado - Valor já acumulado
 * @param valorAlvo - Valor alvo do objetivo
 * @param dataConclusao - Data de conclusão (formato YYYY-MM-DD)
 * @returns "no_prazo" ou "atrasado"
 */
export function calcularStatusObjetivo(
  valorAcumulado: number,
  valorAlvo: number,
  dataConclusao: string
): "no_prazo" | "atrasado" {
  const hoje = new Date()
  const conclusao = new Date(dataConclusao)

  // Se já passou da data de conclusão, considera atrasado
  if (hoje > conclusao) {
    return "atrasado"
  }

  // Calcular meses totais e passados
  const mesesTotais = (conclusao.getFullYear() - hoje.getFullYear()) * 12 + (conclusao.getMonth() - hoje.getMonth())
  const mesesPassados = 0 - mesesTotais // negativo porque estamos contando para trás

  // Valor esperado até hoje
  const esperadoAteHoje = (valorAlvo / Math.abs(mesesTotais)) * Math.abs(mesesPassados)

  return valorAcumulado >= esperadoAteHoje ? "no_prazo" : "atrasado"
}

/**
 * Calcula o número de meses restantes até a data de conclusão.
 * @param dataConclusao - Data de conclusão (formato YYYY-MM-DD)
 * @returns Número de meses restantes (0 se já passou)
 */
export function calcularMesesRestantes(dataConclusao: string): number {
  const hoje = new Date()
  const conclusao = new Date(dataConclusao)

  const anos = conclusao.getFullYear() - hoje.getFullYear()
  const meses = conclusao.getMonth() - hoje.getMonth()

  const total = anos * 12 + meses

  return Math.max(0, total)
}
