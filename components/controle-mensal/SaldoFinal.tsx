/**
 * SaldoFinal
 *
 * Exibe o saldo planejado vs realizado em destaque.
 * Fórmula: Saldo = Renda − Fixas − Variáveis
 */

import { calcularSaldoFinal, formatarMoeda } from "@/lib/calculations"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TotaisData {
  renda: number
  fixas: number
  variaveis: number
}

export interface SaldosData {
  planejado: TotaisData
  realizado: TotaisData
}

interface SaldoFinalProps {
  data: SaldosData
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function SaldoFinal({ data }: SaldoFinalProps) {
  const saldoPlanejado = calcularSaldoFinal(
    data.planejado.renda,
    data.planejado.fixas,
    data.planejado.variaveis
  )

  const saldoRealizado = calcularSaldoFinal(
    data.realizado.renda,
    data.realizado.fixas,
    data.realizado.variaveis
  )

  const diferenca = saldoRealizado - saldoPlanejado

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo Final</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Saldo Planejado */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Planejado</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatarMoeda(saldoPlanejado)}
            </p>
          </div>

          {/* Saldo Realizado */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Realizado</p>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                saldoRealizado >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {formatarMoeda(saldoRealizado)}
            </p>
          </div>

          {/* Diferença */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Diferença</p>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                diferenca >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {diferenca >= 0 ? "+" : ""}
              {formatarMoeda(diferenca)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
