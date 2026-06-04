/**
 * BlocoFinanceiro
 *
 * Componente reutilizável para exibir um bloco financeiro
 * (Renda, Despesas Fixas ou Despesas Variáveis).
 *
 * Exibe uma tabela com 3 colunas: Planejado | Realizado | Diferença
 */

import { cn } from "@/lib/utils"
import { formatarMoeda, calcularDiferenca } from "@/lib/calculations"
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

export interface ItemBloco {
  nome: string
  planejado: number
  realizado: number
}

export interface BlocoData {
  titulo: string
  itens: ItemBloco[]
}

interface BlocoFinanceiroProps {
  data: BlocoData
}

// ─── Helper Components ───────────────────────────────────────────────────────────

function TabelaBloco({ itens }: { itens: ItemBloco[] }) {
  // Calcular totais
  const totalPlanejado = itens.reduce((sum, item) => sum + item.planejado, 0)
  const totalRealizado = itens.reduce((sum, item) => sum + item.realizado, 0)
  const totalDiferenca = calcularDiferenca(totalRealizado, totalPlanejado)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Planejado</TableHead>
          <TableHead className="text-right">Realizado</TableHead>
          <TableHead className="text-right">Diferença</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item) => {
          const diferenca = calcularDiferenca(item.realizado, item.planejado)

          return (
            <TableRow key={item.nome}>
              <TableCell className="font-medium">{item.nome}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatarMoeda(item.planejado)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatarMoeda(item.realizado)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono font-medium tabular-nums",
                  diferenca >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {diferenca >= 0 ? "+" : ""}
                {formatarMoeda(diferenca)}
              </TableCell>
            </TableRow>
          )
        })}

        {/* Linha de Total */}
        <TableRow className="bg-muted/50">
          <TableCell className="font-semibold">Total</TableCell>
          <TableCell className="text-right font-mono font-semibold tabular-nums">
            {formatarMoeda(totalPlanejado)}
          </TableCell>
          <TableCell className="text-right font-mono font-semibold tabular-nums">
            {formatarMoeda(totalRealizado)}
          </TableCell>
          <TableCell
            className={cn(
              "text-right font-mono font-semibold tabular-nums",
              totalDiferenca >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {totalDiferenca >= 0 ? "+" : ""}
            {formatarMoeda(totalDiferenca)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function BlocoFinanceiro({ data }: BlocoFinanceiroProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{data.titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <TabelaBloco itens={data.itens} />
      </CardContent>
    </Card>
  )
}
