"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { calcularDiferenca, formatarMoeda } from "@/lib/calculations"

// ─── Types ─────────────────────────────────────────────────────────────────────

type MesData = {
  mes: string
  mesIndex: number
  planejado: number
  realizado: number
  diferenca: number
}

// ─── Dados Mockados ─────────────────────────────────────────────────────────────

// Dados mockados realistas com base no perfil:
// Renda mensal: ~R$ 7.500
// Despesas fixas: ~R$ 3.200
// Despesas variáveis: ~R$ 1.800
// Total saindo: ~R$ 5.000
// Saldo planejado: ~R$ 2.500

const DADOS_MOCKADOS_2026: MesData[] = [
  { mes: "Jan", mesIndex: 1, planejado: 2500, realizado: 2420, diferenca: -80 },
  { mes: "Fev", mesIndex: 2, planejado: 2500, realizado: 2680, diferenca: 180 },
  { mes: "Mar", mesIndex: 3, planejado: 2500, realizado: 2350, diferenca: -150 },
  { mes: "Abr", mesIndex: 4, planejado: 2550, realizado: 2720, diferenca: 170 },
  { mes: "Mai", mesIndex: 5, planejado: 2550, realizado: 2480, diferenca: -70 },
  { mes: "Jun", mesIndex: 6, planejado: 2600, realizado: 2850, diferenca: 250 },
  { mes: "Jul", mesIndex: 7, planejado: 2600, realizado: 2540, diferenca: -60 },
  { mes: "Ago", mesIndex: 8, planejado: 2650, realizado: 2890, diferenca: 240 },
  { mes: "Set", mesIndex: 9, planejado: 2650, realizado: 2420, diferenca: -230 },
  { mes: "Out", mesIndex: 10, planejado: 2700, realizado: 2850, diferenca: 150 },
  { mes: "Nov", mesIndex: 11, planejado: 2700, realizado: 2650, diferenca: -50 },
  { mes: "Dez", mesIndex: 12, planejado: 3200, realizado: 3500, diferenca: 300 },
]

// ─── Chart Config ───────────────────────────────────────────────────────────────

const chartConfig: ChartConfig = {
  planejado: {
    label: "Planejado",
    color: "var(--color-primary)",
  },
  realizado: {
    label: "Realizado",
    color: "var(--color-success)",
  },
  diferenca: {
    label: "Diferença",
    color: "var(--color-muted-foreground)",
  },
}

// ─── Componentes ─────────────────────────────────────────────────────────────────

function UserName() {
  const [userName, setUserName] = useState<string>("Carregando...")

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Buscar nome da tabela profiles
          const { data } = await supabase
            .from("profiles")
            .select("nome_completo")
            .eq("id", user.id)
            .single()

          setUserName(data?.nome_completo || user.email?.split("@")[0] || "Usuário")
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        setUserName("Usuário")
      }
    }

    loadUser()
  }, [])

  // Extrair iniciais
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{userName}</span>
    </div>
  )
}

function YearSelector() {
  const [ano, setAno] = useState(2026)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setAno((a) => a - 1)}
        aria-label="Ano anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-16 text-center font-semibold tabular-nums">{ano}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setAno((a) => a + 1)}
        aria-label="Próximo ano"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

async function handleLogout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = "/login"
}

// ─── Página ─────────────────────────────────────────────────────────────────────

export default function ControleAnualPage() {
  const router = useRouter()

  const handleMonthClick = (mesIndex: number) => {
    router.push(`/controle-mensal?mes=${mesIndex}`)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle Anual</h1>
          <p className="text-muted-foreground">
            Visão consolidada do ano com planejado vs realizado
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <UserName />
          <YearSelector />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>Comparativo entre planejado e realizado</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full md:h-80 lg:h-96">
            <BarChart data={DADOS_MOCKADOS_2026} barGap={4} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
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
              <Bar dataKey="diferenca" fill="var(--color-diferenca)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhe Mensal</CardTitle>
          <CardDescription>
            Clique em qualquer mês para ver o controle mensal completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Planejado</TableHead>
                  <TableHead className="text-right">Realizado</TableHead>
                  <TableHead className="text-right">Diferença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DADOS_MOCKADOS_2026.map((row) => (
                  <TableRow
                    key={row.mes}
                    className="cursor-pointer"
                    onClick={() => handleMonthClick(row.mesIndex)}
                  >
                    <TableCell className="font-medium">{row.mes}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatarMoeda(row.planejado)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatarMoeda(row.realizado)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono font-medium tabular-nums",
                        row.diferenca >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {row.diferenca >= 0 ? "+" : ""}
                      {formatarMoeda(row.diferenca)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
