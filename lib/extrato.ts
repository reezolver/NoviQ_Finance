/**
 * Montagem do **extrato mensal** — fonte única dos números do Controle Mensal
 * (Spec 04) e do PDF de exportação (Spec 11).
 *
 * Recebe as linhas cruas das queries (lançamentos, orçamentos, categorias) e
 * devolve a estrutura pronta para renderizar: saldo do mês, 3 blocos
 * (Renda/Fixa/Variável) com Planejado × Realizado × Diferença, resumo 50‑30‑20
 * e detalhamento. Toda a aritmética financeira vem de `lib/calculations.ts` —
 * aqui só há orquestração, **nunca cálculo inline**.
 *
 * Pura (server-safe e client-safe): a page (Server Component) e o Route Handler
 * de export consomem a MESMA função, garantindo que o PDF bate com a tela.
 */

import {
  agregarAportesPorObjetivo,
  agregarCategoriasDoMes,
  calcularDiferenca,
  calcularDistribuicao503020,
  calcularPercentual,
  calcularSaldoMes,
  REGRA_503020,
  totalizarPorGrupo,
  type CategoriaAgregada,
  type GrupoCategoria,
} from "@/lib/calculations"
import type { SaldosData, TotaisData } from "@/types/financeiro"

/** Rótulo curto de cada grupo (eixo do gráfico, badge do detalhamento). */
export const GRUPO_LABEL: Record<GrupoCategoria, string> = {
  renda: "Renda",
  fixa: "Fixa",
  variavel: "Variável",
  investimento: "Investimento",
}

/** Título do bloco (cabeçalho da seção na tela e no PDF). */
const TITULO_BLOCO: Record<Extract<GrupoCategoria, "renda" | "fixa" | "variavel">, string> = {
  renda: "Renda",
  fixa: "Despesa Fixa",
  variavel: "Despesa Variável",
}

/** Mapeia cada grupo para o campo correspondente em `TotaisData`. */
const CAMPO_POR_GRUPO: Record<GrupoCategoria, keyof TotaisData> = {
  renda: "renda",
  fixa: "fixas",
  variavel: "variaveis",
  investimento: "investimento",
}

/** Ordem dos blocos exibidos (investimento não é um 4º bloco — vai no resumo). */
const GRUPOS_BLOCO = ["renda", "fixa", "variavel"] as const

// ─── Linhas cruas das queries ────────────────────────────────────────────────────

export interface LancamentoRow {
  valor: number
  categoria_id: string | null
  /** Grupo do aporte (só quando `categoria_id` é nulo). Spec 24. */
  grupo: GrupoCategoria | null
  /** Objetivo do aporte (só quando é um lançamento de objetivo). */
  objetivo_id: string | null
}

/** Objetivo (id + nome) — para rotular o aporte "Aporte: <nome>". */
export interface ObjetivoRow {
  id: string
  nome: string
}

export interface OrcamentoRow {
  categoria_id: string
  valor_planejado: number
  ano: number | null
  mes: number | null
}

export interface CategoriaRow {
  id: string
  nome: string
  grupo: GrupoCategoria
}

// ─── Estrutura de saída ────────────────────────────────────────────────────────

/** Uma linha (categoria) de um bloco. Diferença = Planejado − Realizado. */
export interface LinhaExtrato {
  id: string
  nome: string
  planejado: number
  realizado: number
  diferenca: number
}

/** Total de um bloco. Diferença = Planejado − Realizado. */
export interface TotalBloco {
  planejado: number
  realizado: number
  diferenca: number
}

/** Um bloco do extrato (Renda / Despesa Fixa / Despesa Variável). */
export interface BlocoExtrato {
  grupo: Extract<GrupoCategoria, "renda" | "fixa" | "variavel">
  titulo: string
  linhas: LinhaExtrato[]
  total: TotalBloco
}

/** Uma faixa da regra 50‑30‑20 (Fixa / Variável / Investimento). */
export interface FaixaExtrato {
  rotulo: string
  grupo: Extract<GrupoCategoria, "fixa" | "variavel" | "investimento">
  metaPct: number
  ideal: number
  realizado: number
  percentualRenda: number
}

/** Linha do detalhamento por categoria (realizado + % sobre a renda). */
export interface DetalheCategoria {
  id: string
  nome: string
  grupo: GrupoCategoria
  realizado: number
  percentualRenda: number
}

/** Ponto do gráfico Planejado × Realizado por grupo. */
export interface PontoGrafico {
  grupo: string
  planejado: number
  realizado: number
}

/** Extrato completo do mês — consumido pela tela e pelo PDF. */
export interface ExtratoMensal {
  categoriasAgregadas: CategoriaAgregada[]
  saldos: SaldosData
  saldoPlanejado: number
  saldoRealizado: number
  saldoDiferenca: number
  rendaBase: number
  blocos: BlocoExtrato[]
  faixas: FaixaExtrato[]
  detalhamento: DetalheCategoria[]
  dadosGrafico: PontoGrafico[]
}

/**
 * Monta o extrato do mês a partir das linhas cruas das queries. Replica a
 * agregação do Spec 04 (mesmas funções de `lib/calculations.ts`), então os
 * números do PDF batem com a tela por construção.
 *
 * **Aportes de objetivo (Spec 24):** lançamentos sem categoria mas **com grupo**
 * (fixa|variavel) entram no **realizado** do seu grupo — somam em
 * `saldos.realizado[fixas|variaveis]` antes do saldo/blocos/faixas, então o
 * saldo do realizado, o 50‑30‑20 e o % da renda já refletem o aporte por
 * construção. Cada objetivo vira uma linha "Aporte: <nome>" (planejado 0) no
 * bloco do grupo e no detalhamento, com id `aporte-<objetivoId>`.
 */
export function montarExtratoMensal({
  ano,
  mes,
  categorias,
  lancamentos,
  orcamentos,
  objetivos = [],
}: {
  ano: number
  mes: number
  categorias: ReadonlyArray<CategoriaRow>
  lancamentos: ReadonlyArray<LancamentoRow>
  orcamentos: ReadonlyArray<OrcamentoRow>
  objetivos?: ReadonlyArray<ObjetivoRow>
}): ExtratoMensal {
  const nomePorId = new Map(categorias.map((c) => [c.id, c.nome]))
  const grupoPorId = new Map(categorias.map((c) => [c.id, c.grupo]))
  const nomeObjetivoPorId = new Map(objetivos.map((o) => [o.id, o.nome]))

  // Agregação por categoria (Planejado × Realizado) do mês — base de tudo.
  const categoriasAgregadas = agregarCategoriasDoMes({
    mes,
    categorias: categorias.map((c) => ({ id: c.id, grupo: c.grupo })),
    lancamentos: lancamentos
      .filter((l): l is LancamentoRow & { categoria_id: string } => l.categoria_id !== null)
      .map((l) => ({ categoriaId: l.categoria_id, valor: Number(l.valor) })),
    orcamentos: orcamentos
      .filter(
        (o) =>
          (o.ano === null && o.mes === null) || (o.ano === ano && o.mes === mes)
      )
      .map((o) => ({
        categoriaId: o.categoria_id,
        grupo: grupoPorId.get(o.categoria_id) ?? "variavel",
        valorPlanejado: Number(o.valor_planejado),
        mes: o.mes,
      })),
  })

  // Aportes de objetivo: lançamentos sem categoria, com grupo (fixa|variavel).
  const aportes = agregarAportesPorObjetivo(
    lancamentos
      .filter(
        (l): l is LancamentoRow & { grupo: "fixa" | "variavel"; objetivo_id: string } =>
          l.categoria_id === null &&
          l.objetivo_id !== null &&
          (l.grupo === "fixa" || l.grupo === "variavel")
      )
      .map((l) => ({
        objetivoId: l.objetivo_id,
        nome: nomeObjetivoPorId.get(l.objetivo_id) ?? "Objetivo",
        grupo: l.grupo,
        valor: Number(l.valor),
      }))
  )

  const saldos = totalizarPorGrupo(categoriasAgregadas)
  // Mescla os aportes no realizado do grupo escolhido — antes do saldo/faixas.
  for (const a of aportes) {
    saldos.realizado[a.grupo === "fixa" ? "fixas" : "variaveis"] += a.valor
  }

  // ── Saldo do mês (4 grupos) ──
  const saldoPlanejado = calcularSaldoMes(saldos.planejado)
  const saldoRealizado = calcularSaldoMes(saldos.realizado)
  const saldoDiferenca = calcularDiferenca(saldoRealizado, saldoPlanejado)

  // ── Linhas/total por bloco ──
  const blocos: BlocoExtrato[] = GRUPOS_BLOCO.map((grupo) => {
    const linhas = categoriasAgregadas
      .filter((c) => c.grupo === grupo)
      .map((c) => ({
        id: c.categoriaId,
        nome: nomePorId.get(c.categoriaId) ?? "Sem nome",
        planejado: c.planejado,
        realizado: c.realizado,
        // Diferença da linha = Planejado − Realizado (spec §4).
        diferenca: calcularDiferenca(c.planejado, c.realizado),
      }))
      .filter((l) => l.planejado !== 0 || l.realizado !== 0)

    // Aportes do grupo entram como linhas "Aporte: <nome>" (planejado 0).
    for (const a of aportes) {
      const grupoAporte = a.grupo === "fixa" ? "fixa" : "variavel"
      if (grupoAporte !== grupo) continue
      linhas.push({
        id: `aporte-${a.objetivoId}`,
        nome: `Aporte: ${a.nome}`,
        planejado: 0,
        realizado: a.valor,
        diferenca: calcularDiferenca(0, a.valor),
      })
    }

    const campo = CAMPO_POR_GRUPO[grupo]
    const planejado = saldos.planejado[campo]
    const realizado = saldos.realizado[campo]
    return {
      grupo,
      titulo: TITULO_BLOCO[grupo],
      linhas,
      total: { planejado, realizado, diferenca: calcularDiferenca(planejado, realizado) },
    }
  })

  // ── Resumo 50‑30‑20 (base = renda planejada; fallback p/ realizada) ──
  const rendaBase =
    saldos.planejado.renda > 0 ? saldos.planejado.renda : saldos.realizado.renda
  const ideais = calcularDistribuicao503020(rendaBase)
  const faixas: FaixaExtrato[] = [
    {
      rotulo: "Despesa Fixa",
      grupo: "fixa",
      metaPct: REGRA_503020.fixa * 100,
      ideal: ideais.fixo,
      realizado: saldos.realizado.fixas,
      percentualRenda: calcularPercentual(saldos.realizado.fixas, rendaBase),
    },
    {
      rotulo: "Despesa Variável",
      grupo: "variavel",
      metaPct: REGRA_503020.variavel * 100,
      ideal: ideais.variavel,
      realizado: saldos.realizado.variaveis,
      percentualRenda: calcularPercentual(saldos.realizado.variaveis, rendaBase),
    },
    {
      rotulo: "Investimento",
      grupo: "investimento",
      metaPct: REGRA_503020.investimento * 100,
      ideal: ideais.investimento,
      realizado: saldos.realizado.investimento,
      percentualRenda: calcularPercentual(saldos.realizado.investimento, rendaBase),
    },
  ]

  // ── Gráfico: Planejado × Realizado por grupo ──
  const dadosGrafico: PontoGrafico[] = (
    ["renda", "fixa", "variavel", "investimento"] as const
  ).map((grupo) => {
    const campo = CAMPO_POR_GRUPO[grupo]
    return {
      grupo: GRUPO_LABEL[grupo],
      planejado: saldos.planejado[campo],
      realizado: saldos.realizado[campo],
    }
  })

  // ── Detalhamento por categoria (realizado + % sobre a renda) ──
  const detalhamento: DetalheCategoria[] = [
    ...categoriasAgregadas
      .filter((c) => c.realizado !== 0)
      .map((c) => ({
        id: c.categoriaId,
        nome: nomePorId.get(c.categoriaId) ?? "Sem nome",
        grupo: c.grupo,
        realizado: c.realizado,
        percentualRenda: calcularPercentual(c.realizado, rendaBase),
      })),
    // Aportes de objetivo entram no detalhamento com seu grupo e % da renda.
    ...aportes.map((a) => ({
      id: `aporte-${a.objetivoId}`,
      nome: `Aporte: ${a.nome}`,
      grupo: a.grupo as GrupoCategoria,
      realizado: a.valor,
      percentualRenda: calcularPercentual(a.valor, rendaBase),
    })),
  ].sort((a, b) => b.realizado - a.realizado)

  return {
    categoriasAgregadas,
    saldos,
    saldoPlanejado,
    saldoRealizado,
    saldoDiferenca,
    rendaBase,
    blocos,
    faixas,
    detalhamento,
    dadosGrafico,
  }
}
