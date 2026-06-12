/**
 * Painel do Educador - Lista de Clientes (Client Component)
 *
 * Visual estilo Google Tag Manager com containers por cliente.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, Users2, UserPlus, ClipboardList, FileText, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

/**
 * Interface para cliente
 */
interface Cliente {
  id: string
  nome: string | null
  email: string | null
  status: 'ativo' | 'pendente' | 'inativo' | null
  created_at: string | null
}

/**
 * Props do componente
 */
interface PainelContainerProps {
  clientes: Cliente[]
}

export function PainelContainer({ clientes }: PainelContainerProps) {
  const router = useRouter()
  const [busca, setBusca] = useState("")

  // Filtrar clientes por nome E email
  const filtrados = clientes.filter(s =>
    (s.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(busca.toLowerCase())
  )

  // Calcular iniciais do nome
  const getIniciais = (nome: string | null) => {
    return (nome || '??')
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  // Formatar data de cadastro
  const formatarData = (created_at: string | null) => {
    if (!created_at) return '—'
    return new Date(created_at).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    })
  }

  // Configuração de status
  const statusConfig = {
    ativo: { label: 'Ativo', className: 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400' },
    pendente: { label: 'Pendente', className: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400' },
    inativo: { label: 'Inativo', className: 'text-muted-foreground bg-muted' },
  }

  const getStatusConfig = (status: Cliente['status']) => {
    return statusConfig[status ?? 'ativo'] ?? statusConfig.ativo
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Seus clientes</h1>
          <p className="text-muted-foreground">Gerencie e acesse as contas dos seus clientes</p>
        </div>

        <Button variant="default">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {/* Campo de busca */}
      <div className="flex items-center gap-2 w-full md:max-w-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Clientes — {filtrados.length}</h2>

        {filtrados.length === 0 && busca.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Users2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="mb-4">Nenhum cliente cadastrado ainda</p>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar primeiro cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filtrados.length === 0 && busca.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum cliente encontrado com &quot;{busca}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtrados.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                iniciais={getIniciais(cliente.nome)}
                dataCadastro={formatarData(cliente.created_at)}
                statusConfig={getStatusConfig(cliente.status)}
                onEnter={() => router.push('/controle-anual')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Card de cliente
 */
interface ClienteCardProps {
  cliente: Cliente
  iniciais: string
  dataCadastro: string
  statusConfig: { label: string; className: string }
  onEnter: () => void
}

function ClienteCard({ cliente, iniciais, dataCadastro, statusConfig, onEnter }: ClienteCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-default">
      <CardContent className="p-4 space-y-3">
        {/* Linha 1: Avatar + Nome + Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center text-sm font-medium flex-shrink-0">
            {iniciais}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {cliente.nome || 'Sem nome'}
            </p>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Cliente
            </span>
          </div>
        </div>

        {/* Linha 2: Status + Data */}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.className}`}>
            ● {statusConfig.label}
          </span>
          <span className="text-xs text-muted-foreground">{dataCadastro}</span>
        </div>

        {/* Botão Entrar */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onEnter}
        >
          Entrar
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
