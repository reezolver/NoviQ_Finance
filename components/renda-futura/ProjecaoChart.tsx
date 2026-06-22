"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatarMoeda } from "@/lib/calculations"

/** Um ponto da projeção ano a ano (já decomposto em aportado × rendimento). */
export interface PontoProjecao {
  /** Idade naquele ano (eixo X). */
  idade: number
  /** Total acumulado aportado até o ano. */
  aportado: number
  /** Rendimento acumulado até o ano (patrimônio − aportado). */
  rendimento: number
}

const config = {
  aportado: { label: "Total aportado", color: "var(--chart-2)" },
  rendimento: { label: "Rendimento", color: "var(--chart-1)" },
} satisfies ChartConfig

/**
 * **Projeção de Renda Futura** (Spec 10): área empilhada do patrimônio ao longo
 * das idades — base = total aportado, topo = rendimento (juros). Cores via
 * tokens do design system → válido em dark + light. Recebe os pontos já
 * calculados em `lib/calculations.ts` (`calcularRendaFuturaAnual`).
 */
export function ProjecaoChart({
  pontos,
}: {
  pontos: ReadonlyArray<PontoProjecao>
}) {
  return (
    <ChartContainer config={config} className="h-72 w-full">
      <AreaChart data={pontos as PontoProjecao[]} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="idade"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v) => `${v} anos`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) => `${label} anos`}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {config[name as keyof typeof config]?.label ?? name}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatarMoeda(typeof value === "number" ? value : 0)}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="aportado"
          type="monotone"
          stackId="patrimonio"
          stroke="var(--color-aportado)"
          fill="var(--color-aportado)"
          fillOpacity={0.25}
        />
        <Area
          dataKey="rendimento"
          type="monotone"
          stackId="patrimonio"
          stroke="var(--color-rendimento)"
          fill="var(--color-rendimento)"
          fillOpacity={0.25}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
