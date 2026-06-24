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

/** Um ponto do gráfico: novos cadastros de um mês, por papel. */
export interface NovosUsuariosChartData {
  /** Rótulo do mês no eixo X (ex.: "jan/26"). */
  mes: string
  educadores: number
  clientes: number
}

const chartConfig: ChartConfig = {
  educadores: { label: "Educadores", color: "var(--color-chart-1)" },
  clientes: { label: "Clientes", color: "var(--color-chart-2)" },
}

/**
 * Gráfico de barras dos **novos usuários por mês** (últimos meses), separados em
 * educadores × clientes. Client Component (recharts); cores e tema saem dos
 * tokens do design system via `ChartContainer` (dark + light).
 */
export function NovosUsuariosChart({
  data,
}: {
  data: ReadonlyArray<NovosUsuariosChartData>
}) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart
        accessibilityLayer
        data={data as NovosUsuariosChartData[]}
        barGap={4}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          width={32}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="educadores"
          fill="var(--color-educadores)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="clientes"
          fill="var(--color-clientes)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
