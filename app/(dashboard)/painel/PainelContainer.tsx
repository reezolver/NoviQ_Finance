/**
 * Painel do Educador - GTM Style (Client Component)
 *
 * Visual estilo Google Tag Manager com containers por subconta.
 * Cards organizados em duas seções: Pessoal e Clientes.
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
 * Interface para subconta de cliente
 */
interface Subconta {
  id: string
  nome: string | null
  email: string | null
  status: 'ativo' | 'pendente' | 'inativo' | null
  created_at: string | null
  subconta_tipo: 'pessoal' | 'cliente' | null
}

/**
 * Props do componente
 */
interface PainelContainerProps {
  subcontas: Subconta[]
}

export function PainelContainer({ subcontas }: PainelContainerProps) {
  const router = useRouter()
  const [busca, setBusca] = useState("")

  // Filtrar subcontas por nome E email
  const filtradas = subcontas.filter(s =>
    (s.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(busca.toLowerCase())
  )

  // Separar em pessoais e clientes
  const pessoais = filtradas.filter(s => s.subconta_tipo === 'pessoal')
  const clientes = filtradas.filter(s => s.subconta_tipo !== 'pessoal')

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

  const getStatusConfig = (status: Subconta['status']) => {
    return statusConfig[status ?? 'ativo'] ?? statusConfig.ativo
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Suas subcontas</h1>
          <p className="text-muted-foreground">Selecione uma subconta para acessar o dashboard</p>
        </div>

        <Button variant="default">
          Nova subconta
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

      {/* Seção Pessoal */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Pessoal</h2>

        {pessoais.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p className="mb-4">Você ainda não criou sua subconta pessoal</p>
                <Button variant="outline">
                  Criar minha subconta pessoal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pessoais.map((subconta) => (
              <SubcontaCard
                key={subconta.id}
                subconta={subconta}
                iniciais={getIniciais(subconta.nome)}
                dataCadastro={formatarData(subconta.created_at)}
                statusConfig={getStatusConfig(subconta.status)}
                onEnter={() => router.push('/controle-anual')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Seção Clientes */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Clientes — {clientes.length}</h2>

        {clientes.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p>Nenhum cliente cadastrado ainda</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clientes.map((subconta) => (
              <SubcontaCard
                key={subconta.id}
                subconta={subconta}
                iniciais={getIniciais(subconta.nome)}
                dataCadastro={formatarData(subconta.created_at)}
                statusConfig={getStatusConfig(subconta.status)}
                onEnter={() => router.push('/controle-anual')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Estado vazio total */}
      {filtradas.length === 0 && busca.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma subconta encontrada com &quot;{busca}&quot;
        </div>
      )}
    </div>
  )
}

/**
 * Card de subconta
 */
interface SubcontaCardProps {
  subconta: Subconta
  iniciais: string
  dataCadastro: string
  statusConfig: { label: string; className: string }
  onEnter: () => void
}

function SubcontaCard({ subconta, iniciais, dataCadastro, statusConfig, onEnter }: SubcontaCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-default">
      <CardContent className="p-4 space-y-3">
        {/* Linha 1: Avatar + Nome + Badge tipo */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center
            text-sm font-medium flex-shrink-0
            ${subconta.subconta_tipo === 'pessoal'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            }`}>
            {iniciais}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {subconta.nome || 'Sem nome'}
            </p>
            <span className="text-xs text-muted-foreground bg-muted
              px-1.5 py-0.5 rounded">
              {subconta.subconta_tipo === 'pessoal' ? 'Pessoal' : 'Cliente'}
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
