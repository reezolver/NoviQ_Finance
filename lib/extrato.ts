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
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ## CONVENÇÃO ÚNICA DE SINAL (Spec 28) — vale para TODO o app
 *
 * **O número da Diferença carrega o sinal da favorabilidade.**
 * Positivo = bom para o usuário, em qualquer grupo. Logo `+` é **sempre** verde
 * e `−` é **sempre** vermelho, e a regra cabe em uma frase explicável ao cliente
 * final: *"positivo é a seu favor"*.
 *
 * A inversão por grupo acontece **uma única vez, aqui** (`diferencaFavoravel`),
 * nunca na camada de UI:
 * - **renda** e **investimento**: `Realizado − Planejado` (ganhar/aportar mais é bom).
 * - **fixa** e **variavel**: `Planejado − Realizado` (gastar menos é bom).
 * - **saldo do mês**: `Realizado − Planejado` (sobrar mais é bom).
 *
 * Corolário: os helpers de cor (`components/mensal/financeiro-ui.ts`) recebem
 * **só o número** — se alguma chamada precisar do grupo para decidir a cor, a
 * refatoração está errada.
 * ─────────────────────────────────────────────────────────────────────────────
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
const TITULO_BLOCO: Record<GrupoCategoria, string> = {
  renda: "Renda",
  fixa: "Despesa Fixa",
  variavel: "Despesa Variável",
  investimento: "Investimento",
}

/** Mapeia cada grupo para o campo correspondente em `TotaisData`. */
const CAMPO_POR_GRUPO: Record<GrupoCategoria, keyof TotaisData> = {
  renda: "renda",
  fixa: "fixas",
  variavel: "variaveis",
  investimento: "investimento",
}

/**
 * Ordem dos blocos exibidos.
 *
 * ⚠️ **Spec 35 reverte a decisão da Spec 24** (aprovada no PRD §1.3): o
 * investimento passa a ter **linha própria**, como na planilha do cliente. Ele
 * **continua** aparecendo no resumo 50‑30‑20 (é o "20%") — bloco e faixa
 * coexistem (R2), não é ou-um-ou-outro.
 */
const GRUPOS_BLOCO = ["renda", "fixa", "variavel", "investimento"] as const

/**
 * Diferença **assinada pela favorabilidade** — o único lugar do app onde o
 * grupo influencia o sinal (ver a convenção no topo do arquivo).
 *
 * Positivo = favorável ao usuário, negativo = desfavorável, em qualquer grupo:
 * - `renda` / `investimento` → `realizado − planejado` (receber/aportar mais é bom);
 * - `fixa` / `variavel` → `planejado − realizado` (gastar menos é bom).
 *
 * A subtração em si continua sendo `calcularDiferenca` (neutra, em
 * `lib/calculations.ts`); aqui só decidimos a **ordem dos operandos**.
 */
export function diferencaFavoravel(
  grupo: GrupoCategoria,
  planejado: number,
  realizado: number
): number {
  return grupo === "renda" || grupo === "investimento"
    ? calcularDiferenca(realizado, planejado)
    : calcularDiferenca(planejado, realizado)
}

// ─── Linhas cruas das queries ────────────────────────────────────────────────────

export interface LancamentoRow {
  valor: number
  categoria_id: string | null
  /** Grupo do aporte (só quando `categoria_id` é nulo). Spec 24. */
  grupo: GrupoCategoria | null
  /** Objetivo do aporte (só quando é um lançamento de objetivo). */
  objetivo_id: string | null
  /** Identidade do lançamento — necessária para editar/excluir (Spec 37). */
  id?: string
  /** `YYYY-MM-DD`. */
  data?: string
  descricao?: string | null
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
  /**
   * Preenchido quando a categoria e o **espelho de um objetivo** (Spec 36).
   * Opcional porque nem toda tela seleciona a coluna.
   */
  objetivo_id?: string | null
}

// ─── Estrutura de saída ────────────────────────────────────────────────────────

/**
 * Um lançamento individual dentro de uma linha (Spec 37 · RF‑9).
 *
 * Genérico de propósito: a Spec 38 reusa o mesmo drill-down para as despesas do
 * cartão, então nada aqui é acoplado a "categoria" (R7).
 */
export interface LancamentoDetalhe {
  id: string
  /** `YYYY-MM-DD`. */
  data: string
  descricao: string | null
  valor: number
  /** Aporte de objetivo não tem categoria (Spec 24) — importa para editar (R6). */
  categoriaId: string | null
  objetivoId: string | null
  grupo: GrupoCategoria | null
}

/** Uma linha (categoria) de um bloco. Diferença já assinada pela favorabilidade. */
export interface LinhaExtrato {
  id: string
  nome: string
  planejado: number
  realizado: number
  diferenca: number
  /**
   * Lançamentos que compõem o `realizado` desta linha (Spec 37).
   *
   * Vêm no **mesmo payload** do mês: expandir a linha não dispara query nova
   * (R8). Vazio quando a categoria só tem planejado.
   */
  lancamentos: LancamentoDetalhe[]
}

/** Total de um bloco. Diferença já assinada pela favorabilidade. */
export interface TotalBloco {
  planejado: number
  realizado: number
  diferenca: number
}

/** Um bloco do extrato (Renda / Despesa Fixa / Despesa Variável / Investimento). */
export interface BlocoExtrato {
  grupo: GrupoCategoria
  titulo: string
  linhas: LinhaExtrato[]
  total: TotalBloco
}

/**
 * Uma faixa da regra 50‑30‑20 (Fixa / Variável / Investimento), comparando
 * **Planejado × Ideal × Realizado** (Spec 33 · RF‑12).
 *
 * O "40/40/20 do cliente" não é cadastrado em lugar nenhum: `percentualPlanejado`
 * é o próprio orçamento dele lido como percentual da renda planejada. O **Ideal**
 * continua vindo de `REGRA_503020` e não é configurável (R2).
 */
export interface FaixaExtrato {
  rotulo: string
  grupo: Extract<GrupoCategoria, "fixa" | "variavel" | "investimento">
  metaPct: number
  ideal: number
  /** Quanto o cliente planejou para o grupo no mês. */
  planejado: number
  realizado: number
  /** % da renda que o **planejado** representa (o "40/40/20" do cliente). */
  percentualPlanejado: number
  percentualRenda: number
}

/** Linha do detalhamento por categoria (Planejado × Realizado × Diferença). */
export interface DetalheCategoria {
  id: string
  nome: string
  grupo: GrupoCategoria
  planejado: number
  realizado: number
  /** Já assinada pela favorabilidade (Spec 28). */
  diferenca: number
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

  // Aportes de objetivo: lançamentos sem categoria, com grupo. Desde a Spec 35
  // o grupo pode ser `investimento` além de fixa|variavel.
  const aportes = agregarAportesPorObjetivo(
    lancamentos
      .filter(
        (
          l
        ): l is LancamentoRow & {
          grupo: "fixa" | "variavel" | "investimento"
          objetivo_id: string
        } =>
          l.categoria_id === null &&
          l.objetivo_id !== null &&
          (l.grupo === "fixa" ||
            l.grupo === "variavel" ||
            l.grupo === "investimento")
      )
      .map((l) => ({
        objetivoId: l.objetivo_id,
        nome: nomeObjetivoPorId.get(l.objetivo_id) ?? "Objetivo",
        grupo: l.grupo,
        valor: Number(l.valor),
      }))
  )

  // Spec 37: indexa os lancamentos individuais por linha, para o drill-down.
  // Tudo sai do payload que ja veio — nenhuma query nova ao expandir (R8).
  const detalhePorLinha = new Map<string, LancamentoDetalhe[]>()
  for (const l of lancamentos) {
    if (!l.id || !l.data) continue // tela que nao pediu os campos: sem drill-down
    const chave = l.categoria_id ?? (l.objetivo_id ? `aporte-${l.objetivo_id}` : null)
    if (!chave) continue
    const lista = detalhePorLinha.get(chave) ?? []
    lista.push({
      id: l.id,
      data: l.data,
      descricao: l.descricao ?? null,
      valor: Number(l.valor),
      categoriaId: l.categoria_id,
      objetivoId: l.objetivo_id,
      grupo: l.grupo,
    })
    detalhePorLinha.set(chave, lista)
  }
  // Mais recente primeiro — e o que o usuario acabou de lancar.
  for (const lista of detalhePorLinha.values()) {
    lista.sort((a, b) => b.data.localeCompare(a.data))
  }

  const saldos = totalizarPorGrupo(categoriasAgregadas)
  // Mescla os aportes no realizado do grupo escolhido — antes do saldo/faixas.
  for (const a of aportes) {
    saldos.realizado[CAMPO_POR_GRUPO[a.grupo] as "fixas" | "variaveis" | "investimento"] +=
      a.valor
  }

  // ── Saldo do mês (4 grupos) ──
  const saldoPlanejado = calcularSaldoMes(saldos.planejado)
  const saldoRealizado = calcularSaldoMes(saldos.realizado)
  // Saldo: sobrar mais que o planejado é favorável → `Realizado − Planejado`,
  // já na convenção única (positivo = bom). Ver o topo do arquivo.
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
        // Diferença assinada pela favorabilidade (convenção única — Spec 28).
        diferenca: diferencaFavoravel(grupo, c.planejado, c.realizado),
        lancamentos: detalhePorLinha.get(c.categoriaId) ?? [],
      }))
      .filter((l) => l.planejado !== 0 || l.realizado !== 0)

    // Aportes do grupo entram como linhas "Aporte: <nome>" (planejado 0).
    for (const a of aportes) {
      if (a.grupo !== grupo) continue
      linhas.push({
        id: `aporte-${a.objetivoId}`,
        nome: `Aporte: ${a.nome}`,
        planejado: 0,
        realizado: a.valor,
        // Aporte não planejado num grupo de despesa → sempre desfavorável.
        diferenca: diferencaFavoravel(grupo, 0, a.valor),
        lancamentos: detalhePorLinha.get(`aporte-${a.objetivoId}`) ?? [],
      })
    }

    const campo = CAMPO_POR_GRUPO[grupo]
    const planejado = saldos.planejado[campo]
    const realizado = saldos.realizado[campo]
    return {
      grupo,
      titulo: TITULO_BLOCO[grupo],
      linhas,
      total: {
        planejado,
        realizado,
        diferenca: diferencaFavoravel(grupo, planejado, realizado),
      },
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
      planejado: saldos.planejado.fixas,
      realizado: saldos.realizado.fixas,
      percentualPlanejado: calcularPercentual(saldos.planejado.fixas, rendaBase),
      percentualRenda: calcularPercentual(saldos.realizado.fixas, rendaBase),
    },
    {
      rotulo: "Despesa Variável",
      grupo: "variavel",
      metaPct: REGRA_503020.variavel * 100,
      ideal: ideais.variavel,
      planejado: saldos.planejado.variaveis,
      realizado: saldos.realizado.variaveis,
      percentualPlanejado: calcularPercentual(saldos.planejado.variaveis, rendaBase),
      percentualRenda: calcularPercentual(saldos.realizado.variaveis, rendaBase),
    },
    {
      rotulo: "Investimento",
      grupo: "investimento",
      metaPct: REGRA_503020.investimento * 100,
      ideal: ideais.investimento,
      planejado: saldos.planejado.investimento,
      realizado: saldos.realizado.investimento,
      percentualPlanejado: calcularPercentual(saldos.planejado.investimento, rendaBase),
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
      // Spec 33 R5: antes o filtro era só `realizado !== 0`, então a categoria
      // planejada e **não** realizada sumia da tela — justamente o caso que o
      // educador mais precisa ver ("planejou R$ 600 e não lançou nada").
      .filter((c) => c.planejado !== 0 || c.realizado !== 0)
      .map((c) => ({
        id: c.categoriaId,
        nome: nomePorId.get(c.categoriaId) ?? "Sem nome",
        grupo: c.grupo,
        planejado: c.planejado,
        realizado: c.realizado,
        diferenca: diferencaFavoravel(c.grupo, c.planejado, c.realizado),
        percentualRenda: calcularPercentual(c.realizado, rendaBase),
      })),
    // Aportes de objetivo entram no detalhamento com seu grupo e % da renda.
    // Planejado fica 0 até a Spec 36 dar planejado ao objetivo (R9).
    ...aportes.map((a) => ({
      id: `aporte-${a.objetivoId}`,
      nome: `Aporte: ${a.nome}`,
      grupo: a.grupo as GrupoCategoria,
      planejado: 0,
      realizado: a.valor,
      diferenca: diferencaFavoravel(a.grupo, 0, a.valor),
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
