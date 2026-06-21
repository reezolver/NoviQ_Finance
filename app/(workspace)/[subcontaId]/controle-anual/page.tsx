import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  SaldoAnualChart,
  type SaldoAnualChartData,
} from "@/components/controle-anual/SaldoAnualChart"
import {
  agregarPlanejadoPorMes,
  agregarRealizadoPorMes,
  calcularDiferenca,
  calcularSaldoMes,
  formatarMoeda,
  type GrupoCategoria,
} from "@/lib/calculations"
import { cn } from "@/lib/utils"

/**
 * Controle Anual — **primeira tela do cliente ao logar**. Panorama Jan–Dez do
 * saldo mensal (Planejado × Realizado × Diferença). Só visualização: clicar num
 * mês navega para o Controle Mensal daquele mês (Spec 04).
 *
 * Todo cálculo financeiro vive em `lib/calculations.ts`; aqui só buscamos os
 * dados (RLS-enforced) e montamos a UI com tokens do design system (dark+light).
 */

const MESES = [
  { nome: "Janeiro", abrev: "Jan" },
  { nome: "Fevereiro", abrev: "Fev" },
  { nome: "Março", abrev: "Mar" },
  { nome: "Abril", abrev: "Abr" },
  { nome: "Maio", abrev: "Mai" },
  { nome: "Junho", abrev: "Jun" },
  { nome: "Julho", abrev: "Jul" },
  { nome: "Agosto", abrev: "Ago" },
  { nome: "Setembro", abrev: "Set" },
  { nome: "Outubro", abrev: "Out" },
  { nome: "Novembro", abrev: "Nov" },
  { nome: "Dezembro", abrev: "Dez" },
] as const

// ─── Tipos das linhas retornadas pelas queries (client Supabase não tipado) ──────

interface LancamentoRow {
  data: string
  valor: number
  categorias: { grupo: GrupoCategoria }
}

interface OrcamentoRow {
  categoria_id: string
  valor_planejado: number
  ano: number | null
  mes: number | null
  categorias: { grupo: GrupoCategoria }
}

// ─── Helpers de UI (cor/sinal — não são cálculo financeiro) ──────────────────────

/** Saldo: realizado acima do planejado é favorável (verde); abaixo, vermelho. */
function corDiferenca(diferenca: number): string {
  if (diferenca > 0) return "text-success"
  if (diferenca < 0) return "text-destructive"
  return "text-muted-foreground"
}

/** Prefixo "+" só para valores positivos (o negativo já vem com sinal). */
function sinal(valor: number): string {
  return valor > 0 ? "+" : ""
}

/** Garante um ano válido a partir do query param, com fallback no ano atual. */
function resolverAno(anoParam: string | undefined): number {
  const ano = Number(anoParam)
  if (Number.isInteger(ano) && ano >= 2000 && ano <= 2100) return ano
  return new Date().getFullYear()
}

export default async function ControleAnualPage({
  params,
  searchParams,
}: {
  params: Promise<{ subcontaId: string }>
  searchParams: Promise<{ ano?: string }>
}) {
  const { subcontaId } = await params
  const { ano: anoParam } = await searchParams
  const ano = resolverAno(anoParam)

  const supabase = await createSupabaseServerClient()

  // Duas queries agregadas (sem N+1 por mês). RLS já escopa pela subconta.
  const [{ data: lancamentosData }, { data: orcamentosData }] = await Promise.all([
    supabase
      .from("lancamentos")
      .select("data, valor, categorias!inner(grupo)")
      .eq("subconta_id", subcontaId)
      .gte("data", `${ano}-01-01`)
      .lte("data", `${ano}-12-31`),
    supabase
      .from("orcamentos")
      .select("categoria_id, valor_planejado, ano, mes, categorias!inner(grupo)")
      .eq("subconta_id", subcontaId),
  ])

  const lancamentos = (lancamentosData ?? []) as unknown as LancamentoRow[]
  const orcamentos = (orcamentosData ?? []) as unknown as OrcamentoRow[]

  // Realizado: soma de lançamentos por mês/grupo.
  const realizadoPorMes = agregarRealizadoPorMes(
    lancamentos.map((l) => ({
      mes: Number(l.data.slice(5, 7)),
      grupo: l.categorias.grupo,
      valor: Number(l.valor),
    }))
  )

  // Planejado: recorrentes (mes/ano null) + overrides do ano selecionado.
  const planejadoPorMes = agregarPlanejadoPorMes(
    orcamentos
      .filter(
        (o) =>
          (o.ano === null && o.mes === null) || (o.ano === ano && o.mes !== null)
      )
      .map((o) => ({
        categoriaId: o.categoria_id,
        grupo: o.categorias.grupo,
        valorPlanejado: Number(o.valor_planejado),
        mes: o.mes,
      }))
  )

  // Modelo de visão dos 12 meses.
  const meses = MESES.map((m, i) => {
    const saldoPlanejado = calcularSaldoMes(planejadoPorMes[i])
    const saldoRealizado = calcularSaldoMes(realizadoPorMes[i])
    return {
      numero: i + 1,
      nome: m.nome,
      abrev: m.abrev,
      saldoPlanejado,
      saldoRealizado,
      // Saldo: Realizado − Planejado → positivo (verde) = favorável.
      diferenca: calcularDiferenca(saldoRealizado, saldoPlanejado),
    }
  })

  const totalPlanejado = meses.reduce((s, m) => s + m.saldoPlanejado, 0)
  const totalRealizado = meses.reduce((s, m) => s + m.saldoRealizado, 0)
  const totalDiferenca = calcularDiferenca(totalRealizado, totalPlanejado)

  const dadosGrafico: SaldoAnualChartData[] = meses.map((m) => ({
    mes: m.abrev,
    planejado: m.saldoPlanejado,
    realizado: m.saldoRealizado,
  }))

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      {/* Cabeçalho + navegação de ano */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Controle Anual</h1>
          <p className="text-sm text-muted-foreground">
            Panorama do saldo mensal — Planejado, Realizado e Diferença.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon-sm" aria-label={`Ver ${ano - 1}`}>
            <Link href={`?ano=${ano - 1}`}>
              <ChevronLeft />
            </Link>
          </Button>
          <span className="min-w-14 text-center text-lg font-semibold tabular-nums">
            {ano}
          </span>
          <Button asChild variant="outline" size="icon-sm" aria-label={`Ver ${ano + 1}`}>
            <Link href={`?ano=${ano + 1}`}>
              <ChevronRight />
            </Link>
          </Button>
        </div>
      </div>

      {/* Resumo do ano */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ResumoCard rotulo="Saldo Planejado" valor={totalPlanejado} />
        <ResumoCard rotulo="Saldo Realizado" valor={totalRealizado} />
        <ResumoCard rotulo="Diferença" valor={totalDiferenca} colorir />
      </div>

      {/* Gráfico em destaque */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saldo ao longo do ano</CardTitle>
          <CardDescription>
            Comparativo mensal entre o planejado e o realizado em {ano}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SaldoAnualChart data={dadosGrafico} />
        </CardContent>
      </Card>

      {/* Grade dos 12 meses (cada card navega para o Controle Mensal) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {meses.map((m) => (
          <Link
            key={m.numero}
            href={`/${subcontaId}/mensal/${ano}/${m.numero}`}
            className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`Abrir Controle Mensal de ${m.nome} de ${ano}`}
          >
            <Card
              size="sm"
              className="h-full gap-3 transition hover:ring-2 hover:ring-primary/40"
            >
              <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-sm">{m.nome}</CardTitle>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Diferença</span>
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold tabular-nums",
                      corDiferenca(m.diferenca)
                    )}
                  >
                    {sinal(m.diferenca)}
                    {formatarMoeda(m.diferenca)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Planejado</span>
                  <span className="font-mono tabular-nums">
                    {formatarMoeda(m.saldoPlanejado)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Realizado</span>
                  <span className="font-mono tabular-nums">
                    {formatarMoeda(m.saldoRealizado)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

/** Card de KPI do ano. Quando `colorir`, pinta o valor pela convenção de saldo. */
function ResumoCard({
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
            colorir ? corDiferenca(valor) : "text-foreground"
          )}
        >
          {colorir ? sinal(valor) : ""}
          {formatarMoeda(valor)}
        </p>
      </CardContent>
    </Card>
  )
}
