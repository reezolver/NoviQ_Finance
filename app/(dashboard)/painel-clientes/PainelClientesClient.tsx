/**
 * Painel de Clientes do Educador (Client Component)
 *
 * Componente cliente com toda a lógica de interatividade:
 * - Busca de clientes
 * - Renderização de estados (vazio/com clientes)
 * - Navegação para dashboard do cliente
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Interface para o perfil do cliente
 */
interface ClientePerfil {
  id: string
  nome: string | null
  status: 'ativo' | 'pendente' | 'inativo' | null
  created_at: string | null
}

/**
 * Props do componente
 */
interface PainelClientesClientProps {
  clientes: ClientePerfil[] | null
}

export function PainelClientesClient({ clientes }: PainelClientesClientProps) {
  const router = useRouter()
  const [busca, setBusca] = useState("")

  // Filtrar clientes por nome (client-side)
  const clientesFiltrados = (clientes || []).filter((cliente) =>
    (cliente.nome || '').toLowerCase().includes(busca.toLowerCase())
  )

  // Verificar se está vazio
  const isVazio = !clientes || clientes.length === 0

  // Renderizar badge de status
  const renderStatusBadge = (status: ClientePerfil['status']) => {
    const isAtivo = !status || status === 'ativo'
    const isPendente = status === 'pendente'
    const isInativo = status === 'inativo'

    return (
      <Badge
        className={isAtivo ? 'bg-success text-success-foreground' : ''}
        variant={isAtivo ? 'outline' : isPendente ? 'secondary' : 'destructive'}
      >
        {isAtivo ? 'Ativo' : isPendente ? 'Aguardando' : 'Inativo'}
      </Badge>
    )
  }

  // Formatar data de cadastro
  const formatarDataCadastro = (created_at: ClientePerfil['created_at']) => {
    if (!created_at) return 'Data não disponível'
    return `Membro desde ${new Date(created_at).toLocaleDateString('pt-BR')}`
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Meus Clientes</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe seus clientes</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="default">
            Novo Cliente
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" disabled>
                  Enviar Anamnese
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Em breve</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Estado vazio */}
      {isVazio ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Users className="size-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Você ainda não tem clientes cadastrados
          </h3>
          <p className="text-muted-foreground text-center mb-6">
            Clique em &quot;Novo Cliente&quot; para adicionar seu primeiro cliente
          </p>
          <Button variant="default">
            Adicionar primeiro cliente
          </Button>
        </div>
      ) : (
        <>
          {/* Barra de busca e contador */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:max-w-sm">
              <Input
                placeholder="Buscar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {clientes.length}
              </span>{' '}
              cliente{clientes.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Grid de clientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientesFiltrados.map((cliente) => (
              <Card key={cliente.id} className="w-full">
                <CardContent className="p-6 space-y-4">
                  {/* Nome */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {cliente.nome || 'Sem nome'}
                    </h3>
                  </div>

                  {/* Badge de status */}
                  <div>
                    {renderStatusBadge(cliente.status)}
                  </div>

                  {/* Data de cadastro */}
                  <p className="text-sm text-muted-foreground">
                    {formatarDataCadastro(cliente.created_at)}
                  </p>

                  {/* Botão de ação */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/controle-anual')}
                  >
                    Acessar Dashboard
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estado de busca sem resultados */}
          {clientesFiltrados.length === 0 && busca.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente encontrado com &quot;{busca}&quot;
            </div>
          )}
        </>
      )}
    </div>
  )
}
