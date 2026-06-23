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

/**
 * Agrega uma lista plana de itens `{ grupo, valor }` num **único** `TotaisData`
 * (sem dimensão de mês). Útil para o total acumulado do histórico (Spec 25) e
 * para o carry de anos anteriores no Controle Anual.
 * @param itens - Itens com grupo e valor (já com o grupo resolvido)
 * @returns Um `TotaisData` com a soma por grupo
 */
export function agregarTotais(
  itens: ReadonlyArray<{ grupo: GrupoCategoria; valor: number }>
): TotaisData {
  const totais = totaisZerados()
  for (const { grupo, valor } of itens) {
    totais[GRUPO_PARA_CAMPO[grupo]] += valor
  }
  return totais
}

/**
 * Saldo em conta **acumulado** num ponto único (fim do mês alvo): saldo de
 * partida + Σ do saldo de cada mês até o alvo (inclusive). Saldo de um mês =
 * `renda − fixa − variavel − investimento` (mesma composição de
 * {@link calcularSaldoMes}, incluindo o aporte como saída — Spec 24).
 * @param saldoBase - Saldo inicial (+ carry de anos anteriores)
 * @param realizadoAteOMes - Baldes de realizado até o mês alvo (inclusive)
 * @returns Saldo em conta ao fim do mês alvo
 */
export function calcularSaldoAcumulado(
  saldoBase: number,
  realizadoAteOMes: ReadonlyArray<TotaisData>
): number {
  return realizadoAteOMes.reduce((acc, totais) => acc + calcularSaldoMes(totais), saldoBase)
}

/**
 * Saldo em conta **acumulado ao fim de cada mês**: prefixo cumulativo de
 * {@link calcularSaldoMes} a partir de `saldoBase`.
 * @param saldoBase - Saldo inicial (+ carry de anos anteriores)
 * @param realizadoPorMes - 12 baldes do ano (ver {@link agregarRealizadoPorMes})
 * @returns 12 valores (índice 0 = fim de Janeiro … 11 = fim de Dezembro)
 */
export function calcularSaldoAcumuladoPorMes(
  saldoBase: number,
  realizadoPorMes: ReadonlyArray<TotaisData>
): number[] {
  const saldos: number[] = []
  let acumulado = saldoBase
  for (const totais of realizadoPorMes) {
    acumulado += calcularSaldoMes(totais)
    saldos.push(acumulado)
  }
  return saldos
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

// ─── Aportes de objetivo (lançamentos sem categoria, com grupo) ─────────────────

/** Aporte de objetivo sem categoria, já com grupo e nome do objetivo (Spec 24). */
export interface AporteSemCategoria {
  /** Id do objetivo do aporte. */
  objetivoId: string
  /** Nome do objetivo (para o rótulo "Aporte: <nome>"). */
  nome: string
  /** Grupo escolhido no lançamento (só fixa | variavel). */
  grupo: Extract<GrupoCategoria, "fixa" | "variavel">
  /** Valor do aporte. */
  valor: number
}

/**
 * Soma os aportes **por objetivo** — uma entrada por objetivo, com o valor
 * total somado. Mantém o grupo e o nome do primeiro aporte de cada objetivo
 * (todos os aportes de um mesmo objetivo no mês compartilham objetivo/grupo).
 * @param aportes - Aportes do mês (já sem categoria, com grupo)
 * @returns Uma `AporteSemCategoria` por objetivo, valor somado
 */
export function agregarAportesPorObjetivo(
  aportes: ReadonlyArray<AporteSemCategoria>
): AporteSemCategoria[] {
  const porObjetivo = new Map<string, AporteSemCategoria>()
  for (const a of aportes) {
    const atual = porObjetivo.get(a.objetivoId)
    if (atual) {
      atual.valor += a.valor
    } else {
      porObjetivo.set(a.objetivoId, { ...a })
    }
  }
  return Array.from(porObjetivo.values())
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

// ─── Investimentos / Patrimônio (derivados — Spec 09) ────────────────────────────

/**
 * Multiplicador da meta de reserva de emergência (decisão de produto #4,
 * 2026-06-20): a reserva ideal é **6× as despesas mensais**. Fonte única —
 * nunca repetir o `6` inline.
 */
export const MULTIPLICADOR_RESERVA_EMERGENCIA = 6

/**
 * **Total Aplicado** de um ativo da carteira = `valor + rentabilidade`.
 * @param valor - Valor aportado/saldo do ativo
 * @param rentabilidade - Rendimento acumulado do ativo
 * @returns Total aplicado
 */
export function calcularTotalAplicado(valor: number, rentabilidade: number): number {
  return valor + rentabilidade
}

/**
 * **Patrimônio Líquido (derivado)** = `Σ patrimônio − Σ dívidas`.
 * @param totalPatrimonio - Soma dos valores em `patrimonio`
 * @param totalDividas - Soma dos `valor_total` em `dividas`
 * @returns Patrimônio líquido (pode ser negativo)
 */
export function calcularPatrimonioLiquido(
  totalPatrimonio: number,
  totalDividas: number
): number {
  return totalPatrimonio - totalDividas
}

/**
 * Média da **despesa mensal** realizada (`fixa + variavel`) sobre os meses que
 * tiveram movimento. Base da meta de reserva (decisão #4). Reusa a agregação do
 * Spec 04 (`agregarRealizadoPorMes`): quem chama passa os 12 baldes do ano.
 * Meses sem despesa não diluem a média (estado vazio = 0, nunca erro).
 * @param realizadoPorMes - 12 `TotaisData` do realizado (ver `agregarRealizadoPorMes`)
 * @returns Despesa mensal média (0 se não houve despesa)
 */
export function calcularDespesaMensalMedia(
  realizadoPorMes: ReadonlyArray<TotaisData>
): number {
  const comMovimento = realizadoPorMes.filter((m) => m.fixas + m.variaveis > 0)
  if (comMovimento.length === 0) return 0
  const soma = comMovimento.reduce((acc, m) => acc + m.fixas + m.variaveis, 0)
  return soma / comMovimento.length
}

/** Reserva de emergência: valor atual, meta (6×) e progresso (atual ÷ meta). */
export interface StatusReserva {
  /** Reserva atual (Σ patrimônio com finalidade = reserva). */
  atual: number
  /** Meta = `MULTIPLICADOR_RESERVA_EMERGENCIA × despesas mensais`. */
  meta: number
  /** Progresso = `atual ÷ meta` (0–1+; 0 quando a meta é 0). */
  progresso: number
}

/**
 * **Reserva de emergência (derivado)** — meta `6× despesas mensais` e status
 * (`atual ÷ meta`). Divisão por zero tratada graciosamente (meta 0 → progresso 0).
 * @param reservaAtual - Σ patrimônio com finalidade = reserva
 * @param despesaMensal - Despesa mensal (ver `calcularDespesaMensalMedia`)
 * @returns Reserva atual, meta e progresso
 */
export function calcularStatusReserva(
  reservaAtual: number,
  despesaMensal: number
): StatusReserva {
  const meta = despesaMensal * MULTIPLICADOR_RESERVA_EMERGENCIA
  return {
    atual: reservaAtual,
    meta,
    progresso: meta === 0 ? 0 : reservaAtual / meta,
  }
}

/** Um ativo da carteira reduzido ao essencial para agregação por chave. */
export interface AtivoAgregavel {
  /** Chave de agrupamento (categoria de investimento ou finalidade); `null` = sem chave. */
  chave: string | null
  /** Valor do ativo. */
  valor: number
  /** Rentabilidade acumulada do ativo. */
  rentabilidade: number
}

/**
 * Agrega o **Total Aplicado** (`valor + rentabilidade`) por chave — usado tanto
 * para a **distribuição por categoria** quanto para o **resumo Reserva vs
 * Patrimônio** por finalidade. Ativos com `chave = null` são ignorados.
 * @param ativos - Ativos da carteira (chave, valor, rentabilidade)
 * @returns Mapa chave → total aplicado somado
 */
export function agregarTotalAplicadoPorChave(
  ativos: ReadonlyArray<AtivoAgregavel>
): Map<string, number> {
  const totais = new Map<string, number>()
  for (const a of ativos) {
    if (a.chave === null) continue
    totais.set(
      a.chave,
      (totais.get(a.chave) ?? 0) + calcularTotalAplicado(a.valor, a.rentabilidade)
    )
  }
  return totais
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

/**
 * Projeção de **Renda Futura** (aposentadoria) com **capitalização ANUAL**,
 * alinhada à planilha do Thiago (fonte de verdade — ver Spec 10 §4).
 *
 * ⚠️ Por que existe além de `calcularJurosCompostos`: aquela capitaliza ao
 * **mês** (`M = P(1+i)^n + PMT((1+i)^n − 1)/i`), o que diverge da planilha. Aqui
 * o capital evolui ano a ano pela recorrência da planilha — os 12 aportes do
 * ano entram e só então o montante rende a taxa anual:
 *
 *     C(0)   = capitalInicial
 *     C(n+1) = (C(n) + aporteMensal × 12) × (1 + taxa)
 *
 * Use esta versão na tela de Renda Futura para os números baterem com a planilha.
 * Casos de borda tratados sem crash: `idadeAlvo ≤ idadeAtual` → horizonte 0
 * (só o ano atual); `taxa 0` → sem rendimento (só acumula aportes).
 *
 * @param capitalInicial - Aporte inicial aplicado
 * @param aporteMensal - Aporte mensal (somado 12× por ano)
 * @param taxaAnual - Taxa média anual em % (ex.: 10 = 10% a.a.)
 * @param idadeAtual - Idade atual (início da projeção)
 * @param idadeAlvo - Idade-alvo (fim); horizonte (anos) = `idadeAlvo − idadeAtual`
 */
export function calcularRendaFuturaAnual(
  capitalInicial: number,
  aporteMensal: number,
  taxaAnual: number,
  idadeAtual: number,
  idadeAlvo: number
): ProjetoJurosCompostos {
  const taxa = taxaAnual / 100
  const aporteNoAno = aporteMensal * 12
  const anos = Math.max(0, Math.floor(idadeAlvo - idadeAtual))
  const anoCalendarioBase = new Date().getFullYear()

  // Ano 0 = ponto de partida (sem aporte/rendimento computados ainda).
  const projecaoAnual: AnoProjetado[] = [
    {
      idade: idadeAtual,
      ano: anoCalendarioBase,
      patrimonioAcumulado: capitalInicial,
      aporteNoAno: 0,
      rendimentoNoAno: 0,
    },
  ]

  let patrimonioAcumulado = capitalInicial
  for (let ano = 1; ano <= anos; ano++) {
    const anterior = patrimonioAcumulado
    patrimonioAcumulado = (anterior + aporteNoAno) * (1 + taxa)
    projecaoAnual.push({
      idade: idadeAtual + ano,
      ano: anoCalendarioBase + ano,
      patrimonioAcumulado,
      aporteNoAno,
      rendimentoNoAno: patrimonioAcumulado - anterior - aporteNoAno,
    })
  }

  const patrimonioFinal = patrimonioAcumulado
  const totalAportado = capitalInicial + aporteNoAno * anos
  const rendimentoTotal = patrimonioFinal - totalAportado
  const rendaPassivaMensal = (patrimonioFinal * taxa) / 12

  return {
    patrimonioFinal,
    totalAportado,
    rendimentoTotal,
    rendaPassivaMensal,
    projecaoAnual,
  }
}

/**
 * **Patrimônio Necessário** para sustentar uma renda passiva pela perpetuidade:
 * `(rendaPassivaMensal × 12) / taxa`. Taxa ≤ 0 → retorna `0` (perpetuidade
 * indefinida; evita divisão por zero / `Infinity`).
 *
 * @param rendaPassivaMensal - Renda passiva mensal desejada
 * @param taxaAnual - Taxa média anual em % (ex.: 10 = 10% a.a.)
 */
export function calcularPatrimonioNecessario(
  rendaPassivaMensal: number,
  taxaAnual: number
): number {
  const taxa = taxaAnual / 100
  if (taxa <= 0) return 0
  return (rendaPassivaMensal * 12) / taxa
}
