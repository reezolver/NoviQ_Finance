"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Target,
  TrendingUp,
  PiggyBank,
  Menu,
  X,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

/**
 * Layout do dashboard com sidebar de navegação.
 * Envolve todas as páginas do grupo de rota (dashboard).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  const navItems = [
    {
      href: "/controle-anual",
      label: "Controle Anual",
      icon: LayoutDashboard,
    },
    {
      href: "/controle-mensal",
      label: "Controle Mensal",
      icon: Calendar,
    },
    {
      href: "/objetivos",
      label: "Objetivos",
      icon: Target,
    },
    {
      href: "/investimentos",
      label: "Investimentos",
      icon: TrendingUp,
    },
    {
      href: "/renda-futura",
      label: "Renda Futura",
      icon: PiggyBank,
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay escuro no mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar fixa */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar overflow-y-auto transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <span className="text-xl font-bold text-primary">Noviq</span>
          {/* Botão fechar no mobile */}
          <button
            onClick={closeSidebar}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="size-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé da sidebar com ThemeToggle */}
        <div className="border-t border-border p-4">
          <ThemeToggle />
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
          <span className="ml-4 text-xl font-bold text-primary">Noviq</span>
        </header>

        {children}
      </main>
    </div>
  )
}
