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
} from "lucide-react"

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
      {/* Sidebar fixa */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-xl font-bold text-primary">Noviq</span>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
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
      </aside>

      {/* Área principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
