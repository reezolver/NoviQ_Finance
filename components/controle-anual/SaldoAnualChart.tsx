"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatarMoeda } from "@/lib/calculations"

/** Um ponto do gráfico: saldo planejado × realizado de um mês. */
export interface SaldoAnualChartData {
  /** Rótulo do mês no eixo X (ex.: "Jan"). */
  mes: string
  /** Saldo planejado do mês. */
  planejado: number
  /** Saldo realizado do mês. */
  realizado: number
}

const chartConfig: ChartConfig = {
  planejado: { label: "Planejado", color: "var(--color-chart-1)" },
  realizado: { label: "Realizado", color: "var(--color-chart-2)" },
}

/** Eixo Y compacto (ex.: "R$ 4 mil") — mantém o gráfico limpo. */
const formatarEixo = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  })

/**
 * Gráfico de barras do **saldo mensal** (Planejado × Realizado) ao longo do ano.
 * Client Component (recharts). Cores e tema vêm dos tokens do design system via
 * `ChartContainer`, válido em dark + light.
 */
export function SaldoAnualChart({ data }: { data: ReadonlyArray<SaldoAnualChartData> }) {
  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <BarChart
        accessibilityLayer
        data={data as SaldoAnualChartData[]}
        barGap={4}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          width={72}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => formatarEixo(typeof value === "number" ? value : 0)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                formatarMoeda(typeof value === "number" ? value : 0)
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="planejado" fill="var(--color-planejado)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="realizado" fill="var(--color-realizado)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
