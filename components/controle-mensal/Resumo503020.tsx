/**
 * Resumo503020
 *
 * Exibe o resumo da distribuição 50-30-20 com 3 linhas:
 * - Planejado: percentuais sobre renda planejada
 * - Realizado: percentuais sobre renda realizada
 * - Ideal: 50% Fixo | 30% Variável | 20% Investimento
 */

import { formatarMoeda } from "@/lib/calculations"
import {
  calcularDistribuicao503020,
  calcularPercentual,
  type Distribuicao503020,
} from "@/lib/calculations"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TotaisData {
  renda: number
  fixas: number
  variaveis: number
  investimento: number
}

export interface ResumoData {
  planejado: TotaisData
  realizado: TotaisData
}

interface Resumo503020Props {
  data: ResumoData
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

function calcularPercentuais(
  totais: TotaisData,
  renda: number
): { fixo: string; variavel: string; investimento: string } {
  return {
    fixo: calcularPercentual(totais.fixas, renda).toFixed(1) + "%",
    variavel: calcularPercentual(totais.variaveis, renda).toFixed(1) + "%",
    investimento: calcularPercentual(totais.investimento, renda).toFixed(1) + "%",
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function Resumo503020({ data }: Resumo503020Props) {
  // Distribuição ideal (sobre renda planejada)
  const ideal = calcularDistribuicao503020(data.planejado.renda)

  // Percentuais planejados
  const pctPlanejado = calcularPercentuais(data.planejado, data.planejado.renda)

  // Percentuais realizados
  const pctRealizado = calcularPercentuais(data.realizado, data.realizado.renda)

  // Percentuais ideais
  const pctIdeal = {
    fixo: "50.0%",
    variavel: "30.0%",
    investimento: "20.0%",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo 50-30-20</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Planejado</TableHead>
              <TableHead className="text-right">Realizado</TableHead>
              <TableHead className="text-right">Ideal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Fixo */}
            <TableRow>
              <TableCell className="font-medium">Fixo (50%)</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(data.planejado.fixas)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctPlanejado.fixo}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(data.realizado.fixas)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctRealizado.fixo}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(ideal.fixo)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctIdeal.fixo}
                  </span>
                </div>
              </TableCell>
            </TableRow>

            {/* Variável */}
            <TableRow>
              <TableCell className="font-medium">Variável (30%)</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(data.planejado.variaveis)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctPlanejado.variavel}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(data.realizado.variaveis)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctRealizado.variavel}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(ideal.variavel)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctIdeal.variavel}
                  </span>
                </div>
              </TableCell>
            </TableRow>

            {/* Investimento */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Investimento (20%)</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(data.planejado.investimento)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctPlanejado.investimento}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(data.realizado.investimento)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctRealizado.investimento}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono tabular-nums text-sm">
                    {formatarMoeda(ideal.investimento)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {pctIdeal.investimento}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
