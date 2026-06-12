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
  Users2,
  UserPlus,
  ClipboardList,
  FileText,
  ChevronLeft,
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

/**
 * Layout do dashboard com sidebar de navegação contextual.
 * Menu muda conforme o tipo de perfil e a rota atual.
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

  // Verificar se está no painel do educador
  const isEducadorHome = pathname === '/painel-clientes'

  // Itens do menu financeiro (cliente)
  const financeiroNavItems = [
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

  // Itens do menu do educador (no painel)
  const educadorNavItems = [
    {
      href: "/painel-clientes",
      label: "Todos os clientes",
      icon: Users2,
      active: true,
    },
    {
      label: "Adicionar subconta",
      icon: UserPlus,
      disabled: true,
      tooltip: "Em breve",
    },
  ]

  // Itens de anamnese (educador)
  const anamneseItems = [
    {
      label: "Enviar ficha",
      icon: ClipboardList,
      disabled: true,
      badge: "Em breve",
    },
    {
      label: "Fichas enviadas",
      icon: FileText,
      disabled: true,
      badge: "Em breve",
    },
  ]

  // Item do master
  const masterNavItem = {
    href: "/master",
    label: "Master",
    icon: Shield,
  }

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
          {/* Link "Voltar ao painel" para educador fora do painel */}
          {!isEducadorHome && (userType === 'educador' || userType === 'master') && (
            <Link
              href="/painel-clientes"
              onClick={closeSidebar}
              className="flex items-center gap-2 text-xs text-muted-foreground
                hover:text-foreground mb-3 pb-3 border-b"
            >
              <ChevronLeft className="h-3 w-3" />
              Voltar ao painel
            </Link>
          )}

          {/* Menu do educador (no painel) */}
          {isEducadorHome && (userType === 'educador' || userType === 'master') ? (
            <>
              {/* Seção Subcontas */}
              <div className="space-y-1 mb-4">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subcontas
                </p>
                {educadorNavItems.map((item, index) => {
                  const Icon = item.icon

                  if (item.disabled) {
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                          text-muted-foreground opacity-50 cursor-not-allowed"
                        title={item.tooltip}
                      >
                        <Icon className="size-5" />
                        {item.label}
                      </div>
                    )
                  }

                  if (item.href) {
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          item.active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="size-5" />
                        {item.label}
                      </Link>
                    )
                  }

                  return null
                })}
              </div>

              {/* Seção Anamnese */}
              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Anamnese
                </p>
                {anamneseItems.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                        text-muted-foreground opacity-50 cursor-not-allowed"
                    >
                      <Icon className="size-5" />
                      {item.label}
                      <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              {/* Menu financeiro (cliente ou educador fora do painel) */}
              {financeiroNavItems.map((item) => {
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

              {/* Item Master (apenas para master) */}
              {userType === 'master' && (
                <Link
                  href={masterNavItem.href}
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === masterNavItem.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <masterNavItem.icon className="size-5" />
                  {masterNavItem.label}
                </Link>
              )}
            </>
          )}
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
