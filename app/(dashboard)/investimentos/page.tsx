/**
 * Investimentos
 *
 * Tela para visualizar e acompanhar a carteira de investimentos.
 * Exibe totais por finalidade (Reserva/Patrimônio) e tabela detalhada.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatarMoeda } from "@/lib/calculations"
import { type Investimento, type TipoInvestimento } from "@/types/financeiro"

// ─── Dados Mockados ─────────────────────────────────────────────────────────────

const INVESTIMENTOS_MOCKADOS: Investimento[] = [
  {
    id: "1",
    tipo: "CDB 102%",
    instituicao: "XP",
    categoria: "Renda Fixa",
    valorAplicado: 5000,
    rentabilidade: 250,
    finalidade: "Reserva",
  },
  {
    id: "2",
    tipo: "Tesouro Selic",
    instituicao: "Tesouro Direto",
    categoria: "Renda Fixa",
    valorAplicado: 3000,
    rentabilidade: 120,
    finalidade: "Reserva",
  },
  {
    id: "3",
    tipo: "Fundo Multimercado",
    instituicao: "BTG",
    categoria: "Multimercado",
    valorAplicado: 8000,
    rentabilidade: 480,
    finalidade: "Patrimônio",
  },
  {
    id: "4",
    tipo: "FII XPML11",
    instituicao: "XP",
    categoria: "Renda Variável",
    valorAplicado: 4000,
    rentabilidade: 200,
    finalidade: "Patrimônio",
  },
  {
    id: "5",
    tipo: "CDB 110%",
    instituicao: "Nubank",
    categoria: "Renda Fixa",
    valorAplicado: 2000,
    rentabilidade: 90,
    finalidade: "Reserva",
  },
  {
    id: "6",
    tipo: "Ações ITSA4",
    instituicao: "Clear",
    categoria: "Renda Variável",
    valorAplicado: 3500,
    rentabilidade: -150,
    finalidade: "Patrimônio",
  },
]

// ─── Funções Auxiliares ───────────────────────────────────────────────────────────

function calcularTotais(investimentos: Investimento[]) {
  const totalInvestido = investimentos.reduce((acc, inv) => acc + inv.valorAplicado, 0)
  const totalReserva = investimentos
    .filter((inv) => inv.finalidade === "Reserva")
    .reduce((acc, inv) => acc + inv.valorAplicado, 0)
  const totalPatrimonio = investimentos
    .filter((inv) => inv.finalidade === "Patrimônio")
    .reduce((acc, inv) => acc + inv.valorAplicado, 0)

  return { totalInvestido, totalReserva, totalPatrimonio }
}

function getBadgeVariant(categoria: TipoInvestimento): "default" | "secondary" | "outline" {
  switch (categoria) {
    case "Renda Fixa":
      return "default"
    case "Multimercado":
      return "secondary"
    case "Renda Variável":
      return "outline"
    default:
      return "outline"
  }
}

// ─── Componentes ───────────────────────────────────────────────────────────────────

function ResumoCard({
  titulo,
  valor,
}: {
  titulo: string
  valor: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{valor}</p>
      </CardContent>
    </Card>
  )
}

function InvestimentoRow({ investimento }: { investimento: Investimento }) {
  const badgeVariant = getBadgeVariant(investimento.categoria)
  const rentabilityColor = investimento.rentabilidade >= 0 ? "text-success" : "text-destructive"
  const rentabilityPrefix = investimento.rentabilidade >= 0 ? "+" : ""

  return (
    <TableRow>
      <TableCell className="font-medium">{investimento.tipo}</TableCell>
      <TableCell>{investimento.instituicao}</TableCell>
      <TableCell>
        <Badge variant={badgeVariant}>{investimento.categoria}</Badge>
      </TableCell>
      <TableCell>{formatarMoeda(investimento.valorAplicado)}</TableCell>
      <TableCell className={cn(rentabilityColor, "font-medium")}>
        {rentabilityPrefix}
        {formatarMoeda(investimento.rentabilidade)}
      </TableCell>
      <TableCell>{investimento.finalidade}</TableCell>
    </TableRow>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestimentosPage() {
  const totais = calcularTotais(INVESTIMENTOS_MOCKADOS)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Investimentos</h1>
        <p className="text-muted-foreground">Visão da sua carteira</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResumoCard
          titulo="Total Investido"
          valor={formatarMoeda(totais.totalInvestido)}
        />
        <ResumoCard
          titulo="Total Reserva"
          valor={formatarMoeda(totais.totalReserva)}
        />
        <ResumoCard
          titulo="Total Patrimônio"
          valor={formatarMoeda(totais.totalPatrimonio)}
        />
      </div>

      {/* Tabela de Investimentos */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor Aplicado</TableHead>
                  <TableHead>Rentabilidade</TableHead>
                  <TableHead>Finalidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVESTIMENTOS_MOCKADOS.map((investimento) => (
                  <InvestimentoRow
                    key={investimento.id}
                    investimento={investimento}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
