"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { rotuloSecao } from "@/components/workspace/SidebarNav"
import { MenuUsuario } from "@/components/workspace/MenuUsuario"

/**
 * **Barra de topo do conteúdo** (Spec 18 · RF-1.7), dentro do `SidebarInset`:
 * `SidebarTrigger` (colapsa/expande; atalho `Cmd/Ctrl+B` nativo) + breadcrumb de
 * contexto + `ThemeToggle` + **menu do usuário** (avatar real, canto superior
 * direito).
 *
 * Breadcrumb:
 * - `workspace`: `Noviq / [conta] / [seção]` (seção derivada do segmento atual).
 * - `gestao`: `Noviq / Painel`.
 *
 * (A busca `Cmd+K` é F6 — o espaço fica reservado, sem implementação agora.)
 */
export function Topbar({
  variante,
  contaNome,
  titulo,
  perfil,
}: {
  variante: "workspace" | "gestao"
  /** Nome da subconta ativa — só no workspace. */
  contaNome?: string
  /** Rótulo fixo da trilha (ex.: "Conta") — ignora a derivação por rota. */
  titulo?: string
  /** Identidade do usuário para o menu do canto superior direito (avatar). */
  perfil?: {
    nome?: string | null
    email?: string | null
    avatarUrl?: string | null
    preferenciaInicial?: "pessoal" | "gestor" | null
  }
}) {
  const pathname = usePathname()

  let trilha: string[]
  if (titulo) {
    trilha = [titulo]
  } else if (variante === "gestao") {
    trilha = ["Painel"]
  } else {
    const resto = pathname.split("/").filter(Boolean).slice(1)
    const secao = rotuloSecao(resto[0] ?? "")
    trilha = [contaNome ?? "Conta", ...(secao ? [secao] : [])]
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      {/* No mobile o alvo de toque precisa de ≥44px (Spec 30 · R6); o botão
          padrão tem 28px. No desktop volta ao tamanho do design system. */}
      <SidebarTrigger className="-ml-1 size-11 md:size-7" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <nav aria-label="Trilha" className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link href="/" className="font-medium text-primary hover:underline">
          Noviq
        </Link>
        {trilha.map((item, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1.5">
            <span className="text-muted-foreground" aria-hidden>
              /
            </span>
            <span
              className={
                i === trilha.length - 1
                  ? "truncate font-medium text-foreground"
                  : "truncate text-muted-foreground"
              }
            >
              {item}
            </span>
          </span>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        {perfil ? (
          <MenuUsuario
            nome={perfil.nome}
            email={perfil.email}
            avatarUrl={perfil.avatarUrl}
            preferenciaInicial={perfil.preferenciaInicial}
          />
        ) : null}
      </div>
    </header>
  )
}
