/**
 * MonthHeader
 *
 * Header com navegação entre meses.
 * Atualiza a URL (?mes=X) ao navegar.
 */

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const MESES_NOMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

interface MonthHeaderProps {
  ano: number
}

export function MonthHeader({ ano }: MonthHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mesAtual = parseInt(searchParams.get("mes") || "1")

  const irParaMes = (novoMes: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("mes", novoMes.toString())
    router.push(`?${params.toString()}`)
  }

  const mesAnterior = () => {
    const novoMes = mesAtual === 1 ? 12 : mesAtual - 1
    irParaMes(novoMes)
  }

  const proximoMes = () => {
    const novoMes = mesAtual === 12 ? 1 : mesAtual + 1
    irParaMes(novoMes)
  }

  const nomeMes = MESES_NOMES[mesAtual - 1]

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Controle Mensal</h1>
        <p className="text-muted-foreground">
          Detalhe do mês com renda, despesas e saldo final
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={mesAnterior}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-40 text-center font-semibold">
          {nomeMes} {ano}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={proximoMes}
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
