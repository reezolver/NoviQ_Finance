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
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

/**
 * **Navegação contextual da sidebar** (Spec 18) — migra as antigas abas
 * horizontais para itens de `SidebarMenu`, preservando exatamente a detecção de
 * seção ativa, o cálculo de ano/mês do "Mensal" e o indicador de transição
 * (`PendingDot`).
 *
 * Duas variantes:
 * - `workspace`: as 5 seções financeiras (`controle-anual`, `mensal`,
 *   `investimentos`, `objetivos`, `renda-futura`).
 * - `gestao`: nav enxuta do painel — só "Visão geral" → `/painel` (o split em
 *   sub-rotas fica para F6).
 *
 * No mobile, o drawer (Sheet) **fecha ao navegar**: um efeito observa o
 * `pathname` e chama `setOpenMobile(false)` em qualquer mudança de rota — cobre
 * tanto os links daqui quanto o seletor de subconta.
 */

interface Secao {
  /** Segmento da rota após `[subcontaId]` — usado para detectar a seção ativa. */
  chave: string
  rotulo: string
  icone: LucideIcon
}

export const SECOES: readonly Secao[] = [
  { chave: "controle-anual", rotulo: "Anual", icone: CalendarRange },
  { chave: "mensal", rotulo: "Mensal", icone: CalendarDays },
  { chave: "investimentos", rotulo: "Investimentos", icone: Landmark },
  { chave: "objetivos", rotulo: "Objetivos", icone: Target },
  { chave: "renda-futura", rotulo: "Renda Futura", icone: TrendingUp },
] as const

/** Rótulo da seção a partir do segmento — reusado pelo breadcrumb do `Topbar`. */
export function rotuloSecao(chave: string): string | null {
  return SECOES.find((s) => s.chave === chave)?.rotulo ?? null
}

/**
 * Indicador de transição do item clicado. Lê `useLinkStatus()` (só funciona como
 * descendente de um `<Link>`) e, enquanto a navegação está `pending`, mostra um
 * ponto pulsante. Ocupa espaço fixo (toggla `opacity`, não a presença) para não
 * causar layout shift. `bg-current` herda a cor do item (ativo ou não).
 */
function PendingDot() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "ml-auto size-1.5 shrink-0 rounded-full bg-current transition-opacity",
        pending ? "animate-pulse opacity-100" : "opacity-0"
      )}
    />
  )
}

export function SidebarNav({
  variante,
  subcontaId,
}: {
  variante: "workspace" | "gestao"
  subcontaId?: string
}) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  // No mobile, fecha o drawer sempre que a rota muda (navegação por qualquer
  // link da sidebar, incluindo o seletor de subconta).
  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  if (variante === "gestao") {
    const ativo = pathname === "/painel"
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Gestão</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={ativo} tooltip="Visão geral">
              <Link href="/painel" aria-current={ativo ? "page" : undefined}>
                <LayoutDashboard />
                <span>Visão geral</span>
                <PendingDot />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  // Segmentos após o `[subcontaId]`: [0] = seção ativa, [1..] = resto (ano/mês).
  const resto = pathname.split("/").filter(Boolean).slice(1)
  const secaoAtiva = resto[0] ?? ""

  // Mensal precisa de ano/mês. Preserva o aberto; senão, mês corrente.
  const hrefMensal =
    secaoAtiva === "mensal" && resto[1] && resto[2]
      ? `/${subcontaId}/mensal/${resto[1]}/${resto[2]}`
      : (() => {
          const agora = new Date()
          return `/${subcontaId}/mensal/${agora.getFullYear()}/${agora.getMonth() + 1}`
        })()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Seções</SidebarGroupLabel>
      <SidebarMenu>
        {SECOES.map((secao) => {
          const ativa = secao.chave === secaoAtiva
          const href =
            secao.chave === "mensal" ? hrefMensal : `/${subcontaId}/${secao.chave}`
          const Icone = secao.icone
          return (
            <SidebarMenuItem key={secao.chave}>
              <SidebarMenuButton asChild isActive={ativa} tooltip={secao.rotulo}>
                <Link href={href} aria-current={ativa ? "page" : undefined}>
                  <Icone />
                  <span>{secao.rotulo}</span>
                  <PendingDot />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
