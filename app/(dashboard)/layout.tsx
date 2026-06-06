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
  Shield,
  Menu,
  X,
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

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
  const [userType, setUserType] = useState<'cliente' | 'educador' | 'master' | null>(null)

  const closeSidebar = () => setSidebarOpen(false)

  // Carregar tipo de perfil do usuário
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('tipo_perfil')
            .eq('id', user.id)
            .single()

          if (profile) {
            setUserType(profile.tipo_perfil)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      }
    }

    loadUserProfile()
  }, [])

  // Criar navItems baseado no tipo de perfil
  const baseNavItems = [
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

  const masterNavItem = {
    href: "/master",
    label: "Master",
    icon: Shield,
  }

  const navItems = userType === 'master'
    ? [...baseNavItems, masterNavItem]
    : baseNavItems

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
          <span className="ml-4 text-xl font-bold text-primary">Noviq</span>
        </header>

        {children}
      </main>
    </div>
  )
}
