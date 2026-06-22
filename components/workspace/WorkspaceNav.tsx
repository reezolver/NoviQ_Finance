"use client"

import * as React from "react"
import Link, { useLinkStatus } from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarRange,
  CalendarDays,
  Landmark,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * **Navegação primária do workspace** (abas das 5 seções). Resolve o buraco em
 * que Investimentos, Objetivos e Renda Futura ficavam órfãos — sem nenhum link
 * pela UI. Trocar de seção **preserva a subconta ativa** (`[subcontaId]`).
 *
 * A seção ativa é detectada pelo segmento da URL logo após o `[subcontaId]`
 * (`aria-current="page"` + destaque). A aba **Mensal** precisa de ano/mês: se já
 * estivermos no Mensal, mantém o que está aberto; senão, abre o mês corrente.
 *
 * Só `Link`s + tokens do design system (dark + light). Rola na horizontal no
 * mobile para caber as 5 seções.
 */

interface Secao {
  /** Segmento da rota após `[subcontaId]` — usado para detectar a seção ativa. */
  chave: string
  rotulo: string
  icone: LucideIcon
}

const SECOES: readonly Secao[] = [
  { chave: "controle-anual", rotulo: "Anual", icone: CalendarRange },
  { chave: "mensal", rotulo: "Mensal", icone: CalendarDays },
  { chave: "investimentos", rotulo: "Investimentos", icone: Landmark },
  { chave: "objetivos", rotulo: "Objetivos", icone: Target },
  { chave: "renda-futura", rotulo: "Renda Futura", icone: TrendingUp },
] as const

/**
 * Indicador de transição da aba clicada. Lê `useLinkStatus()` (só funciona como
 * descendente de um `<Link>`) e, enquanto a navegação está `pending`, mostra um
 * ponto pulsante. Ocupa espaço fixo (toggla `opacity`, não a presença) para não
 * causar layout shift. `bg-current` herda a cor da aba (ativa ou não).
 */
function PendingDot() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "size-1.5 shrink-0 rounded-full bg-current transition-opacity",
        pending ? "animate-pulse opacity-100" : "opacity-0"
      )}
    />
  )
}

export function WorkspaceNav({ subcontaId }: { subcontaId: string }) {
  const pathname = usePathname()

  // Segmentos após o `[subcontaId]`: [0] = seção ativa, [1..] = resto (ano/mês).
  const resto = pathname.split("/").filter(Boolean).slice(1)
  const secaoAtiva = resto[0] ?? ""

  // Mensal precisa de ano/mês. Preserva o aberto; senão, mês corrente.
  const hrefMensal = React.useMemo(() => {
    if (secaoAtiva === "mensal" && resto[1] && resto[2]) {
      return `/${subcontaId}/mensal/${resto[1]}/${resto[2]}`
    }
    const agora = new Date()
    return `/${subcontaId}/mensal/${agora.getFullYear()}/${agora.getMonth() + 1}`
  }, [secaoAtiva, resto, subcontaId])

  return (
    <nav
      aria-label="Seções"
      className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-2 py-2 md:px-6">
        {SECOES.map((secao) => {
          const ativa = secao.chave === secaoAtiva
          const href =
            secao.chave === "mensal" ? hrefMensal : `/${subcontaId}/${secao.chave}`
          const Icone = secao.icone
          return (
            <Link
              key={secao.chave}
              href={href}
              aria-current={ativa ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                ativa
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icone className="size-4 shrink-0" aria-hidden />
              {secao.rotulo}
              <PendingDot />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
