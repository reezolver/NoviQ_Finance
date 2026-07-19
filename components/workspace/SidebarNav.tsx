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
  Tags,
  LayoutDashboard,
  Users,
  GraduationCap,
  UserPlus,
  ClipboardList,
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
  { chave: "categorias", rotulo: "Categorias", icone: Tags },
] as const

interface SecaoGestao {
  /** Rota completa (sob `/painel`). */
  href: string
  rotulo: string
  icone: LucideIcon
  /** Só master enxerga (Educadores e Leads). */
  somenteMaster?: boolean
}

/**
 * Itens da nav do painel de gestão (Spec 18 + reestruturação do painel master).
 * Cada seção é uma rota própria sob `/painel`. Educador não vê Educadores/Leads.
 */
export const SECOES_GESTAO: readonly SecaoGestao[] = [
  { href: "/painel", rotulo: "Visão geral", icone: LayoutDashboard },
  { href: "/painel/clientes", rotulo: "Clientes", icone: Users },
  {
    href: "/painel/educadores",
    rotulo: "Educadores",
    icone: GraduationCap,
    somenteMaster: true,
  },
  { href: "/painel/leads", rotulo: "Leads", icone: UserPlus, somenteMaster: true },
  { href: "/painel/anamneses", rotulo: "Anamneses", icone: ClipboardList },
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
  isMaster = false,
}: {
  variante: "workspace" | "gestao"
  subcontaId?: string
  /** Na variante `gestao`, libera os itens só-master (Educadores, Leads). */
  isMaster?: boolean
}) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  // No mobile, fecha o drawer sempre que a rota **muda** (navegação por qualquer
  // link da sidebar, incluindo o seletor de subconta).
  //
  // ⚠️ Spec 30 · RF-3 — o `useEffect` também roda na MONTAGEM, e este componente
  // vive dentro do `Sheet`: no celular ele só monta quando o menu abre. Sem a
  // guarda abaixo, abrir o menu montava o `SidebarNav`, que mandava fechar na
  // hora — o menu abria e sumia no mesmo instante, sem dar tempo de tocar em
  // nada. No desktop a sidebar está sempre montada, por isso o defeito era
  // exclusivo do mobile.
  const pathnameAnterior = React.useRef(pathname)
  React.useEffect(() => {
    if (pathnameAnterior.current === pathname) return
    pathnameAnterior.current = pathname
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  if (variante === "gestao") {
    const itens = SECOES_GESTAO.filter((s) => isMaster || !s.somenteMaster)
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Gestão</SidebarGroupLabel>
        <SidebarMenu>
          {itens.map((secao) => {
            // "Visão geral" só ativa em /painel exato; as demais por prefixo
            // (cobre sub-rotas futuras de cada seção).
            const ativo =
              secao.href === "/painel"
                ? pathname === "/painel"
                : pathname === secao.href ||
                  pathname.startsWith(`${secao.href}/`)
            const Icone = secao.icone
            return (
              <SidebarMenuItem key={secao.href}>
                <SidebarMenuButton
                  asChild
                  isActive={ativo}
                  tooltip={secao.rotulo}
                >
                  <Link
                    href={secao.href}
                    aria-current={ativo ? "page" : undefined}
                  >
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
