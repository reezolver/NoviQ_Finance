import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Abreviações dos 12 meses (índice 0 = Janeiro). */
const MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const

/** Mês anterior, rolando para Dezembro do ano anterior quando em Janeiro. */
function mesAnterior(ano: number, mes: number): { ano: number; mes: number } {
  return mes <= 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 }
}

/** Próximo mês, rolando para Janeiro do ano seguinte quando em Dezembro. */
function proximoMes(ano: number, mes: number): { ano: number; mes: number } {
  return mes >= 12 ? { ano: ano + 1, mes: 1 } : { ano, mes: mes + 1 }
}

export interface NavegacaoMesesProps {
  /** Subconta ativa — preservada em toda navegação. */
  subcontaId: string
  /** Ano atual da tela. */
  ano: number
  /** Mês atual da tela (1–12). */
  mes: number
}

/**
 * Navegação por meses: setas anterior/próximo (rolam o ano nas bordas) + faixa
 * dos 12 meses do ano corrente. Trocar de mês **mantém a subconta** — todos os
 * links apontam para `/[subcontaId]/mensal/[ano]/[mes]`. Só `Link`s → renderiza
 * no servidor; tokens do design system (dark + light).
 */
export function NavegacaoMeses({ subcontaId, ano, mes }: NavegacaoMesesProps) {
  const anterior = mesAnterior(ano, mes)
  const proximo = proximoMes(ano, mes)
  const hrefDe = (a: number, m: number) => `/${subcontaId}/mensal/${a}/${m}`

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="outline"
        size="icon-sm"
        aria-label="Mês anterior"
      >
        <Link href={hrefDe(anterior.ano, anterior.mes)}>
          <ChevronLeft />
        </Link>
      </Button>

      <div
        className="flex flex-1 gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1"
        role="tablist"
        aria-label={`Meses de ${ano}`}
      >
        {MESES_ABREV.map((abrev, i) => {
          const numero = i + 1
          const ativo = numero === mes
          return (
            <Link
              key={abrev}
              href={hrefDe(ano, numero)}
              role="tab"
              aria-selected={ativo}
              aria-label={`${abrev} de ${ano}`}
              className={cn(
                "min-w-10 shrink-0 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                ativo
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {abrev}
            </Link>
          )
        })}
      </div>

      <Button asChild variant="outline" size="icon-sm" aria-label="Próximo mês">
        <Link href={hrefDe(proximo.ano, proximo.mes)}>
          <ChevronRight />
        </Link>
      </Button>
    </div>
  )
}
