import { notFound } from "next/navigation"
import { Receipt, ShoppingCart, Wallet } from "lucide-react"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BlocoGrupo, type LinhaBloco } from "@/components/mensal/BlocoGrupo"
import { NavegacaoMeses } from "@/components/mensal/NavegacaoMeses"
import { NovoLancamentoButton } from "@/components/mensal/NovoLancamentoButton"
import {
  ControleMensalChart,
  type ControleMensalChartData,
} from "@/components/mensal/ControleMensalChart"
import {
  Resumo503020,
  type FaixaResumo,
} from "@/components/mensal/Resumo503020"
import {
  agregarCategoriasDoMes,
  calcularDiferenca,
  calcularDistribuicao503020,
  calcularPercentual,
  calcularSaldoMes,
  formatarMoeda,
  REGRA_503020,
  totalizarPorGrupo,
  type GrupoCategoria,
} from "@/lib/calculations"
import type { TotaisData } from "@/types/financeiro"
import { cn } from "@/lib/utils"

/**
 * Controle Mensal — **a tela mais prática do app**. Para o mês da rota:
 * 3 blocos (Renda, Despesa Fixa, Despesa Variável) com Planejado × Realizado ×
 * Diferença, gráfico em destaque, detalhamento por categoria e o resumo
 * 50‑30‑20. O investimento (aporte) entra no saldo e no resumo 50‑30‑20 — não
 * é um 4º bloco grande (decisão de UX alinhada à planilha, onde é o "20%").
 *
 * Server Component: só busca dados (RLS-enforced) e monta a UI. Todo cálculo
 * financeiro vive em `lib/calculations.ts`; cor/sinal em `components/mensal`.
 */

const MESES_NOMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const

/** Mapeia cada grupo para o campo correspondente em `TotaisData`. */
const CAMPO_POR_GRUPO: Record<GrupoCategoria, keyof TotaisData> = {
  renda: "renda",
  fixa: "fixas",
  variavel: "variaveis",
  investimento: "investimento",
}

const GRUPO_LABEL: Record<GrupoCategoria, string> = {
  renda: "Renda",
  fixa: "Fixa",
  variavel: "Variável",
  investimento: "Investimento",
}

// ─── Tipos das linhas retornadas pelas queries (client Supabase não tipado) ──────

interface LancamentoRow {
  valor: number
  categoria_id: string | null
}

interface OrcamentoRow {
  categoria_id: string
  valor_planejado: number
  ano: number | null
  mes: number | null
}

interface CategoriaRow {
  id: string
  nome: string
  grupo: GrupoCategoria
  ordem: number
}

interface ObjetivoRow {
  id: string
  nome: string
}

// ─── Helpers de UI (cor/sinal do saldo — não são cálculo financeiro) ─────────────

/** Saldo: realizado acima do planejado é favorável (verde); abaixo, vermelho. */
function corSaldo(diferenca: number): string {
  if (diferenca > 0) return "text-success"
  if (diferenca < 0) return "text-destructive"
  return "text-muted-foreground"
}

/** Prefixo "+" só para valores positivos (o negativo já vem com sinal). */
function sinalSaldo(valor: number): string {
  return valor > 0 ? "+" : ""
}

/** Valida o segmento numérico do mês (1–12). */
function resolverMes(mesParam: string): number | null {
  const mes = Number(mesParam)
  return Number.isInteger(mes) && mes >= 1 && mes <= 12 ? mes : null
}

/** Valida o segmento do ano (2000–2100). */
function resolverAno(anoParam: string): number | null {
  const ano = Number(anoParam)
  return Number.isInteger(ano) && ano >= 2000 && ano <= 2100 ? ano : null
}

export default async function ControleMensalPage({
  params,
}: {
  params: Promise<{ subcontaId: string; ano: string; mes: string }>
}) {
  const { subcontaId, ano: anoParam, mes: mesParam } = await params
  const ano = resolverAno(anoParam)
  const mes = resolverMes(mesParam)
  if (ano === null || mes === null) {
    notFound()
  }

  const mm = String(mes).padStart(2, "0")
  const inicio = `${ano}-${mm}-01`
  // Limite superior exclusivo = 1º dia do mês seguinte (rola o ano em dezembro).
  const fimExclusivo =
    mes === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mes + 1).padStart(2, "0")}-01`

  const supabase = await createSupabaseServerClient()

  // Quatro queries agregadas (sem N+1). RLS já escopa pela subconta.
  const [
    { data: lancamentosData },
    { data: orcamentosData },
    { data: categoriasData },
    { data: objetivosData },
  ] = await Promise.all([
    supabase
      .from("lancamentos")
      .select("valor, categoria_id")
      .eq("subconta_id", subcontaId)
      .gte("data", inicio)
      .lt("data", fimExclusivo),
    supabase
      .from("orcamentos")
      .select("categoria_id, valor_planejado, ano, mes")
      .eq("subconta_id", subcontaId),
    supabase
      .from("categorias")
      .select("id, nome, grupo, ordem")
      .eq("subconta_id", subcontaId)
      .order("ordem"),
    supabase
      .from("objetivos")
      .select("id, nome")
      .eq("subconta_id", subcontaId)
      .order("created_at"),
  ])

  const lancamentos = (lancamentosData ?? []) as unknown as LancamentoRow[]
  const orcamentos = (orcamentosData ?? []) as unknown as OrcamentoRow[]
  const categorias = (categoriasData ?? []) as unknown as CategoriaRow[]
  const objetivos = (objetivosData ?? []) as unknown as ObjetivoRow[]

  const nomePorId = new Map(categorias.map((c) => [c.id, c.nome]))

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
        grupo: categorias.find((c) => c.id === o.categoria_id)?.grupo ?? "variavel",
        valorPlanejado: Number(o.valor_planejado),
        mes: o.mes,
      })),
  })

  const saldos = totalizarPorGrupo(categoriasAgregadas)

  // ── Saldo do mês (4 grupos) ──
  const saldoPlanejado = calcularSaldoMes(saldos.planejado)
  const saldoRealizado = calcularSaldoMes(saldos.realizado)
  const saldoDiferenca = calcularDiferenca(saldoRealizado, saldoPlanejado)

  // ── Linhas/total por bloco ──
  const linhasDoGrupo = (grupo: GrupoCategoria): LinhaBloco[] =>
    categoriasAgregadas
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

  const totalDoGrupo = (grupo: GrupoCategoria) => {
    const campo = CAMPO_POR_GRUPO[grupo]
    const planejado = saldos.planejado[campo]
    const realizado = saldos.realizado[campo]
    return { planejado, realizado, diferenca: calcularDiferenca(planejado, realizado) }
  }

  // ── Resumo 50‑30‑20 (base = renda planejada; fallback p/ realizada) ──
  const rendaBase =
    saldos.planejado.renda > 0 ? saldos.planejado.renda : saldos.realizado.renda
  const ideais = calcularDistribuicao503020(rendaBase)
  const faixas: FaixaResumo[] = [
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
  const dadosGrafico: ControleMensalChartData[] = (
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
  const detalhamento = categoriasAgregadas
    .filter((c) => c.realizado !== 0)
    .map((c) => ({
      id: c.categoriaId,
      nome: nomePorId.get(c.categoriaId) ?? "Sem nome",
      grupo: c.grupo,
      realizado: c.realizado,
      percentualRenda: calcularPercentual(c.realizado, rendaBase),
    }))
    .sort((a, b) => b.realizado - a.realizado)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      {/* Cabeçalho + ação */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Controle Mensal</h1>
          <p className="text-sm text-muted-foreground">
            {MESES_NOMES[mes - 1]} de {ano} — Planejado, Realizado e Diferença.
          </p>
        </div>
        <NovoLancamentoButton
          subcontaId={subcontaId}
          categorias={categorias.map((c) => ({
            id: c.id,
            nome: c.nome,
            grupo: c.grupo,
          }))}
          objetivos={objetivos.map((o) => ({ id: o.id, nome: o.nome }))}
        />
      </div>

      {/* Navegação por meses (mantém a subconta) */}
      <NavegacaoMeses subcontaId={subcontaId} ano={ano} mes={mes} />

      {/* Saldo do mês */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SaldoCard rotulo="Saldo Planejado" valor={saldoPlanejado} />
        <SaldoCard rotulo="Saldo Realizado" valor={saldoRealizado} />
        <SaldoCard rotulo="Diferença" valor={saldoDiferenca} colorir />
      </div>

      {/* Gráfico em destaque */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planejado × Realizado por grupo</CardTitle>
          <CardDescription>
            Comparativo do mês entre o que foi planejado e o que foi realizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ControleMensalChart data={dadosGrafico} />
        </CardContent>
      </Card>

      {/* 3 blocos */}
      <div className="space-y-4">
        <BlocoGrupo
          titulo="Renda"
          grupo="renda"
          icone={Wallet}
          linhas={linhasDoGrupo("renda")}
          total={totalDoGrupo("renda")}
        />
        <BlocoGrupo
          titulo="Despesa Fixa"
          grupo="fixa"
          icone={Receipt}
          linhas={linhasDoGrupo("fixa")}
          total={totalDoGrupo("fixa")}
        />
        <BlocoGrupo
          titulo="Despesa Variável"
          grupo="variavel"
          icone={ShoppingCart}
          linhas={linhasDoGrupo("variavel")}
          total={totalDoGrupo("variavel")}
        />
      </div>

      {/* Resumo 50‑30‑20 + detalhamento por categoria */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Resumo503020 rendaBase={rendaBase} faixas={faixas} />

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">Detalhamento por categoria</CardTitle>
            <CardDescription>
              Realizado de cada categoria e seu peso sobre a renda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detalhamento.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum lançamento neste mês.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Realizado</TableHead>
                    <TableHead className="text-right">% da renda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalhamento.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{GRUPO_LABEL[item.grupo]}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatarMoeda(item.realizado)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {item.percentualRenda.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/** Card de KPI do saldo. Quando `colorir`, pinta o valor pela convenção de saldo. */
function SaldoCard({
  rotulo,
  valor,
  colorir = false,
}: {
  rotulo: string
  valor: number
  colorir?: boolean
}) {
  return (
    <Card size="sm">
      <CardHeader className="pb-0">
        <CardDescription>{rotulo}</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "font-mono text-xl font-semibold tabular-nums",
            colorir ? corSaldo(valor) : "text-foreground"
          )}
        >
          {colorir ? sinalSaldo(valor) : ""}
          {formatarMoeda(valor)}
        </p>
      </CardContent>
    </Card>
  )
}
