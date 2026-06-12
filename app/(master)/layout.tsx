"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserCircle,
  TrendingUp,
  PiggyBank,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

/**
 * Layout específico para o Master.
 * Sidebar customizada com opções administrativas.
 */
export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [educadoresExpanded, setEducadoresExpanded] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  // Verificar se está em alguma página de educadores/clientes para expandir automaticamente
  useEffect(() => {
    if (pathname.startsWith('/master/educadores') || pathname.startsWith('/master/clientes')) {
      setEducadoresExpanded(true)
    }
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay escuro no mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar fixa */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-sidebar overflow-y-auto transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <span className="text-xl font-bold text-primary">Noviq Master</span>
          {/* Botão fechar no mobile */}
          <button
            onClick={closeSidebar}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="size-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {/* Dashboard */}
          <Link
            href="/master"
            onClick={closeSidebar}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/master"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LayoutDashboard className="size-5" />
            Dashboard
          </Link>

          {/* Painel Master - Sem accordion por enquanto (Collapsible não instalado) */}
          <div className="space-y-1">
            <button
              onClick={() => setEducadoresExpanded(!educadoresExpanded)}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="size-5" />
                Painel Master
              </div>
              <ChevronRight
                className={cn(
                  "size-4 transition-transform",
                  educadoresExpanded && "rotate-90"
                )}
              />
            </button>

            {/* Submenu expandido */}
            {educadoresExpanded && (
              <div className="ml-6 space-y-1">
                <Link
                  href="/master/educadores"
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/master/educadores"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <UserCircle className="size-5" />
                  Educadores
                </Link>

                <Link
                  href="/master/clientes"
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/master/clientes"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Users className="size-5" />
                  Meus Clientes
                </Link>
              </div>
            )}
          </div>

          {/* Minhas Finanças */}
          <Link
            href="/controle-anual"
            onClick={closeSidebar}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/controle-anual"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <TrendingUp className="size-5" />
            Minhas Finanças
          </Link>
        </nav>

        {/* Rodapé da sidebar com UserMenu */}
        <div className="border-t border-border p-4">
          <UserMenu />
        </div>
      </aside>

      {/* Área principal */}
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
        {/* Header mobile com hambúrguer */}
        <header className="flex items-center h-16 border-b border-border bg-background px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-6" />
          </button>
          <span className="ml-4 text-xl font-bold text-primary">Noviq Master</span>
        </header>

        {children}
      </main>
    </div>
  )
}
