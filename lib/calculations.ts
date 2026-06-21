/**
 * Funções de cálculo financeiro da plataforma Noviq.
 * Todas as fórmulas financeiras devem ficar aqui.
 * Nunca escrever cálculos inline nos componentes.
 */

import type { SaldosData, TotaisData } from "@/types/financeiro"

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

// ─── Saldo mensal (4 grupos) ────────────────────────────────────────────────────

/**
 * Grupos da taxonomia de categorias (espelha o enum `grupo_categoria` do banco).
 */
export type GrupoCategoria = "renda" | "fixa" | "variavel" | "investimento"

/** Mapeia cada grupo do banco para o campo correspondente em `TotaisData`. */
const GRUPO_PARA_CAMPO: Record<GrupoCategoria, keyof TotaisData> = {
  renda: "renda",
  fixa: "fixas",
  variavel: "variaveis",
  investimento: "investimento",
}

const MESES_NO_ANO = 12

/** Retorna um `TotaisData` zerado (estado vazio = nunca erro). */
function totaisZerados(): TotaisData {
  return { renda: 0, fixas: 0, variaveis: 0, investimento: 0 }
}

/**
 * Calcula o saldo do mês a partir dos 4 grupos separados.
 * **Saldo = Σrenda − Σfixa − Σvariavel − Σinvestimento** (o aporte/investimento
 * é subtraído do saldo). Evolução de `calcularSaldoFinal`, que não separa o
 * investimento.
 * @param totais - Totais por grupo (planejado ou realizado)
 * @returns Saldo do mês
 */
export function calcularSaldoMes(totais: TotaisData): number {
  return totais.renda - totais.fixas - totais.variaveis - totais.investimento
}

/** Um lançamento já reduzido ao essencial para agregação por mês/grupo. */
export interface LancamentoAgregavel {
  /** Mês do lançamento (1–12). */
  mes: number
  /** Grupo da categoria do lançamento. */
  grupo: GrupoCategoria
  /** Valor do lançamento. */
  valor: number
}

/**
 * Agrega os lançamentos **realizados** de um ano em 12 baldes de `TotaisData`
 * (índice 0 = Janeiro … 11 = Dezembro). Lançamentos fora do intervalo 1–12 são
 * ignorados graciosamente.
 * @param lancamentos - Lançamentos do ano (mês, grupo, valor)
 * @returns Array de 12 `TotaisData` (um por mês)
 */
export function agregarRealizadoPorMes(
  lancamentos: ReadonlyArray<LancamentoAgregavel>
): TotaisData[] {
  const meses = Array.from({ length: MESES_NO_ANO }, totaisZerados)
  for (const { mes, grupo, valor } of lancamentos) {
    if (!Number.isInteger(mes) || mes < 1 || mes > MESES_NO_ANO) continue
    meses[mes - 1][GRUPO_PARA_CAMPO[grupo]] += valor
  }
  return meses
}

/** Uma linha de orçamento já reduzida ao essencial para agregação. */
export interface OrcamentoAgregavel {
  /** Categoria a que o valor pertence (chave para resolver override × recorrente). */
  categoriaId: string
  /** Grupo da categoria. */
  grupo: GrupoCategoria
  /** Valor planejado. */
  valorPlanejado: number
  /** `null` = recorrente (vale todo mês); 1–12 = override pontual daquele mês. */
  mes: number | null
}

/**
 * Agrega o **planejado** de um ano em 12 baldes de `TotaisData`.
 * Para cada categoria e cada mês, o valor efetivo é o **override do mês** (se
 * existir) ou, na sua ausência, o **valor recorrente** da categoria.
 *
 * Espera receber apenas linhas do ano-alvo: os recorrentes (`mes = null`) e os
 * overrides daquele ano. A filtragem por ano fica a cargo de quem chama.
 * @param orcamentos - Linhas de orçamento (recorrentes + overrides do ano)
 * @returns Array de 12 `TotaisData` (um por mês)
 */
export function agregarPlanejadoPorMes(
  orcamentos: ReadonlyArray<OrcamentoAgregavel>
): TotaisData[] {
  const recorrentes = new Map<string, { grupo: GrupoCategoria; valor: number }>()
  const overrides = new Map<string, { grupo: GrupoCategoria; valor: number }>()
  const categoriaIds = new Set<string>()

  for (const o of orcamentos) {
    categoriaIds.add(o.categoriaId)
    if (o.mes === null) {
      recorrentes.set(o.categoriaId, { grupo: o.grupo, valor: o.valorPlanejado })
    } else if (Number.isInteger(o.mes) && o.mes >= 1 && o.mes <= MESES_NO_ANO) {
      overrides.set(`${o.categoriaId}-${o.mes}`, {
        grupo: o.grupo,
        valor: o.valorPlanejado,
      })
    }
  }

  const meses = Array.from({ length: MESES_NO_ANO }, totaisZerados)
  for (let mes = 1; mes <= MESES_NO_ANO; mes++) {
    for (const categoriaId of categoriaIds) {
      const efetivo = overrides.get(`${categoriaId}-${mes}`) ?? recorrentes.get(categoriaId)
      if (!efetivo) continue
      meses[mes - 1][GRUPO_PARA_CAMPO[efetivo.grupo]] += efetivo.valor
    }
  }
  return meses
}

// ─── Agregação por categoria de um mês (blocos + detalhamento) ──────────────────

/** Referência mínima de uma categoria (universo canônico da subconta). */
export interface CategoriaRef {
  /** Id da categoria. */
  id: string
  /** Grupo da categoria. */
  grupo: GrupoCategoria
}

/** Planejado × Realizado já resolvidos para uma categoria num mês. */
export interface CategoriaAgregada {
  /** Id da categoria agregada. */
  categoriaId: string
  /** Grupo da categoria. */
  grupo: GrupoCategoria
  /** Planejado do mês (override do mês ou recorrente da categoria). */
  planejado: number
  /** Realizado do mês (soma dos lançamentos da categoria). */
  realizado: number
}

/**
 * Agrega **Planejado × Realizado por categoria** para um único mês.
 * - **Realizado** = soma dos `lancamentos` da categoria (já filtrados ao mês por
 *   quem chama).
 * - **Planejado** = override do mês (se houver) ou o valor recorrente da
 *   categoria (`mes = null`).
 *
 * Percorre o universo canônico `categorias`, então categorias sem movimento
 * saem zeradas (a page decide se as oculta). Lançamentos/orçamentos cujo
 * `categoriaId` não está no universo são ignorados graciosamente.
 * @returns Uma `CategoriaAgregada` por categoria, na ordem de `categorias`.
 */
export function agregarCategoriasDoMes({
  mes,
  categorias,
  lancamentos,
  orcamentos,
}: {
  mes: number
  categorias: ReadonlyArray<CategoriaRef>
  lancamentos: ReadonlyArray<{ categoriaId: string; valor: number }>
  orcamentos: ReadonlyArray<OrcamentoAgregavel>
}): CategoriaAgregada[] {
  const realizado = new Map<string, number>()
  for (const l of lancamentos) {
    realizado.set(l.categoriaId, (realizado.get(l.categoriaId) ?? 0) + l.valor)
  }

  const recorrente = new Map<string, number>()
  const override = new Map<string, number>()
  for (const o of orcamentos) {
    if (o.mes === null) {
      recorrente.set(o.categoriaId, o.valorPlanejado)
    } else if (o.mes === mes) {
      override.set(o.categoriaId, o.valorPlanejado)
    }
  }

  return categorias.map((c) => ({
    categoriaId: c.id,
    grupo: c.grupo,
    planejado: override.get(c.id) ?? recorrente.get(c.id) ?? 0,
    realizado: realizado.get(c.id) ?? 0,
  }))
}

/**
 * Totaliza as categorias agregadas em `SaldosData` (planejado + realizado por
 * grupo). Base dos 3 blocos e do resumo 50‑30‑20 — sem cálculo inline na page.
 * @param categorias - Categorias já agregadas (ver `agregarCategoriasDoMes`)
 * @returns Totais planejado e realizado por grupo
 */
export function totalizarPorGrupo(
  categorias: ReadonlyArray<CategoriaAgregada>
): SaldosData {
  const planejado = totaisZerados()
  const realizado = totaisZerados()
  for (const c of categorias) {
    planejado[GRUPO_PARA_CAMPO[c.grupo]] += c.planejado
    realizado[GRUPO_PARA_CAMPO[c.grupo]] += c.realizado
  }
  return { planejado, realizado }
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
 * Regra **50‑30‑20** (decisão de produto travada em 2026-06-20): proporção ideal
 * da renda por grupo — 50% despesa fixa, 30% despesa variável, 20% investimento
 * (aporte). Fonte única dos percentuais — nunca repetir `0.5 / 0.3 / 0.2` inline.
 */
export const REGRA_503020 = {
  fixa: 0.5,
  variavel: 0.3,
  investimento: 0.2,
} as const

/**
 * Calcula a distribuição ideal 50-30-20 sobre a renda, usando `REGRA_503020`.
 * @param rendaTotal - Renda base (planejada) sobre a qual os ideais são calculados
 * @returns Objeto com valores ideais (50% fixo, 30% variável, 20% investimento)
 */
export function calcularDistribuicao503020(rendaTotal: number): Distribuicao503020 {
  return {
    fixo: rendaTotal * REGRA_503020.fixa,
    variavel: rendaTotal * REGRA_503020.variavel,
    investimento: rendaTotal * REGRA_503020.investimento,
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

// ─── Funções para Renda Futura (Juros Compostos) ────────────────────────────────────

/**
 * Resultado da projeção de juros compostos.
 */
export interface ProjetoJurosCompostos {
  patrimonioFinal: number
  totalAportado: number
  rendimentoTotal: number
  rendaPassivaMensal: number
  projecaoAnual: AnoProjetado[]
}

/**
 * Dados de um ano na projeção.
 */
export interface AnoProjetado {
  idade: number
  ano: number
  patrimonioAcumulado: number
  aporteNoAno: number
  rendimentoNoAno: number
}

/**
 * Calcula juros compostos com aportes mensais.
 * Fórmula: M = P × (1 + i)^n + PMT × ((1 + i)^n - 1) / i
 * Onde:
 * - P = capital inicial
 * - i = taxa mensal (taxa anual / 12 / 100)
 * - n = número de meses
 * - PMT = aporte mensal
 *
 * @param capitalInicial - Valor inicial aplicado
 * @param aporteMensal - Valor aportado mensalmente
 * @param taxaAnual - Taxa de juros anual (em %)
 * @param anos - Período em anos
 * @param idadeInicial - Idade atual (para projeção)
 */
export function calcularJurosCompostos(
  capitalInicial: number,
  aporteMensal: number,
  taxaAnual: number,
  anos: number,
  idadeInicial: number
): ProjetoJurosCompostos {
  const taxaMensal = taxaAnual / 12 / 100
  const meses = anos * 12
  const anoAtual = new Date().getFullYear()

  // Calcular patrimônio final usando fórmula de juros compostos
  const fatorFuturo = Math.pow(1 + taxaMensal, meses)
  const patrimonioFinal =
    capitalInicial * fatorFuturo +
    aporteMensal * ((fatorFuturo - 1) / taxaMensal)

  // Calcular totais
  const totalAportado = capitalInicial + aporteMensal * meses
  const rendimentoTotal = patrimonioFinal - totalAportado
  const rendaPassivaMensal = (patrimonioFinal * (taxaAnual / 100)) / 12

  // Calcular projeção ano a ano
  const projecaoAnual: AnoProjetado[] = []
  let patrimonioAcumulado = capitalInicial

  for (let ano = 0; ano <= anos; ano++) {
    const mesesNoAno = ano * 12
    const idade = idadeInicial + ano

    // Calcular patrimônio acumulado até este ano
    if (ano === 0) {
      patrimonioAcumulado = capitalInicial
    } else {
      const fator = Math.pow(1 + taxaMensal, mesesNoAno)
      patrimonioAcumulado =
        capitalInicial * fator +
        aporteMensal * ((fator - 1) / taxaMensal)
    }

    // Calcular valores para este ano específico
    const aporteNoAno = aporteMensal * 12

    let rendimentoNoAno = 0
    if (ano === 0) {
      rendimentoNoAno = 0
    } else {
      const patrimonioAnoAnterior = projecaoAnual[ano - 1].patrimonioAcumulado
      rendimentoNoAno = patrimonioAcumulado - patrimonioAnoAnterior - aporteNoAno
    }

    projecaoAnual.push({
      idade,
      ano: anoAtual + ano,
      patrimonioAcumulado,
      aporteNoAno,
      rendimentoNoAno,
    })
  }

  return {
    patrimonioFinal,
    totalAportado,
    rendimentoTotal,
    rendaPassivaMensal,
    projecaoAnual,
  }
}
