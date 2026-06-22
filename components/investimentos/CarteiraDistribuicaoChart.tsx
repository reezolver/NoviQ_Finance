"use client"

import { Cell, Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatarMoeda } from "@/lib/calculations"

/** Uma fatia da distribuição: uma categoria de investimento e seu total aplicado. */
export interface FatiaCategoria {
  /** Chave estável da categoria (ex.: "renda_fixa"). */
  key: string
  /** Rótulo legível (ex.: "Renda Fixa"). */
  name: string
  /** Total aplicado (valor + rentabilidade) da categoria. */
  value: number
  /** Cor (token do design system). */
  color: string
}

/**
 * **Distribuição da carteira** por categoria de investimento (Spec 09). Gráfico
 * de rosca (recharts) com cores via tokens do design system — válido em dark +
 * light. Recebe os totais já calculados em `lib/calculations.ts`.
 */
export function CarteiraDistribuicaoChart({
  fatias,
}: {
  fatias: ReadonlyArray<FatiaCategoria>
}) {
  const config: ChartConfig = Object.fromEntries(
    fatias.map((f) => [f.key, { label: f.name, color: f.color }])
  )

  return (
    <ChartContainer config={config} className="mx-auto h-64 w-full max-w-sm">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                formatarMoeda(typeof value === "number" ? value : 0)
              }
              hideLabel
            />
          }
        />
        <Pie
          data={fatias as FatiaCategoria[]}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={96}
          innerRadius={48}
          paddingAngle={3}
        >
          {fatias.map((f) => (
            <Cell key={f.key} fill={f.color} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </PieChart>
    </ChartContainer>
  )
}
