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

/** Um ponto do gráfico: planejado × realizado de um grupo no mês. */
export interface ControleMensalChartData {
  /** Rótulo do grupo no eixo X (ex.: "Renda", "Despesa Fixa"). */
  grupo: string
  /** Total planejado do grupo. */
  planejado: number
  /** Total realizado do grupo. */
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
 * Gráfico em destaque do mês: **Planejado × Realizado por grupo** (Renda,
 * Despesa Fixa, Despesa Variável, Investimento). Estilo app — não réplica de
 * planilha. Client Component (recharts); cores/tema vêm dos tokens via
 * `ChartContainer`, válido em dark + light.
 */
export function ControleMensalChart({
  data,
}: {
  data: ReadonlyArray<ControleMensalChartData>
}) {
  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <BarChart
        accessibilityLayer
        data={data as ControleMensalChartData[]}
        barGap={4}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="grupo" tickLine={false} axisLine={false} tickMargin={8} />
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
