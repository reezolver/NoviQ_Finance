'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, AlertCircle, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface DashboardStats {
  totalEducadores: number
  totalClientes: number
  pendentesAprovacao: number
  totalUsuarios: number
}

export default function MasterDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalEducadores: 0,
    totalClientes: 0,
    pendentesAprovacao: 0,
    totalUsuarios: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        const supabase = createClient()

        // Buscar total de educadores ativos
        const { count: educadores } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tipo_perfil', 'educador')
          .eq('status', 'ativo')

        // Buscar total de clientes ativos
        const { count: clientes } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tipo_perfil', 'cliente')
          .eq('status', 'ativo')

        // Buscar contas pendentes de aprovação
        const { count: pendentes } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tipo_perfil', 'educador')
          .eq('status', 'pendente')

        // Buscar total de usuários
        const { count: total } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalEducadores: educadores || 0,
          totalClientes: clientes || 0,
          pendentesAprovacao: pendentes || 0,
          totalUsuarios: total || 0,
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Educadores Ativos',
      value: stats.totalEducadores,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Clientes Ativos',
      value: stats.totalClientes,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Pendentes de Aprovação',
      value: stats.pendentesAprovacao,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      showBadge: stats.pendentesAprovacao > 0,
    },
    {
      title: 'Total de Usuários',
      value: stats.totalUsuarios,
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Master</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral da plataforma Noviq Finance
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{card.value}</div>
                  {card.showBadge && (
                    <Badge variant="destructive" className="ml-2">
                      Atenção
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Card de Ação Rápida */}
      {stats.pendentesAprovacao > 0 && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" />
              Ação Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você tem {stats.pendentesAprovacao} educator(es) aguardando aprovação.
            </p>
            <a
              href="/master/educadores"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Revisar Solicitações
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
