import type { LucideIcon } from "lucide-react"

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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatarMoeda, type GrupoCategoria } from "@/lib/calculations"
import { cn } from "@/lib/utils"

import { corDiferenca, sinal } from "./financeiro-ui"

/** Uma linha (categoria) dentro de um bloco. */
export interface LinhaBloco {
  /** Id da categoria. */
  id: string
  /** Nome exibido. */
  nome: string
  /** Planejado da categoria no mês. */
  planejado: number
  /** Realizado da categoria no mês. */
  realizado: number
  /** Diferença = Planejado − Realizado. */
  diferenca: number
}

export interface BlocoGrupoProps {
  /** Título do bloco (ex.: "Renda", "Despesa Fixa"). */
  titulo: string
  /** Grupo da taxonomia — define a semântica de cor da Diferença. */
  grupo: GrupoCategoria
  /** Ícone do bloco (lucide). */
  icone: LucideIcon
  /** Linhas de categoria já calculadas. */
  linhas: ReadonlyArray<LinhaBloco>
  /** Totais do bloco. */
  total: { planejado: number; realizado: number; diferenca: number }
}

/** Célula numérica padrão (mono, tabular, alinhada à direita). */
function CelulaValor({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <TableCell
      className={cn("text-right font-mono tabular-nums", className)}
    >
      {children}
    </TableCell>
  )
}

/**
 * Bloco de um grupo (Renda / Despesa Fixa / Despesa Variável) com a tabela
 * Planejado × Realizado × Diferença por categoria + total. Presentational —
 * todo cálculo chega pronto via props. Tokens do design system → dark + light.
 */
export function BlocoGrupo({
  titulo,
  grupo,
  icone: Icone,
  linhas,
  total,
}: BlocoGrupoProps) {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icone className="size-4 text-muted-foreground" aria-hidden />
          {titulo}
        </CardTitle>
        <span
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            corDiferenca(total.diferenca, grupo)
          )}
        >
          {sinal(total.diferenca)}
          {formatarMoeda(total.diferenca)}
        </span>
      </CardHeader>
      <CardContent>
        {linhas.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sem planejado nem lançamentos neste mês.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Planejado</TableHead>
                <TableHead className="text-right">Realizado</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((linha) => (
                <TableRow key={linha.id}>
                  <TableCell className="font-medium">{linha.nome}</TableCell>
                  <CelulaValor className="text-muted-foreground">
                    {formatarMoeda(linha.planejado)}
                  </CelulaValor>
                  <CelulaValor>{formatarMoeda(linha.realizado)}</CelulaValor>
                  <CelulaValor
                    className={cn("font-medium", corDiferenca(linha.diferenca, grupo))}
                  >
                    {sinal(linha.diferenca)}
                    {formatarMoeda(linha.diferenca)}
                  </CelulaValor>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <CelulaValor>{formatarMoeda(total.planejado)}</CelulaValor>
                <CelulaValor>{formatarMoeda(total.realizado)}</CelulaValor>
                <CelulaValor className={corDiferenca(total.diferenca, grupo)}>
                  {sinal(total.diferenca)}
                  {formatarMoeda(total.diferenca)}
                </CelulaValor>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
