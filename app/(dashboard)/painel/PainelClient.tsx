/**
 * Painel do Educador (Client Component)
 *
 * Componente cliente com toda a lógica de interatividade:
 * - Busca de clientes
 * - Renderização da tabela
 * - Filtragem por nome e email
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

/**
 * Interface para subconta de cliente
 */
interface SubcontaCliente {
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
interface PainelClientProps {
  clientes: SubcontaCliente[] | null
}

export function PainelClient({ clientes }: PainelClientProps) {
  const router = useRouter()
  const [busca, setBusca] = useState("")

  // Filtrar clientes por nome E email
  const clientesFiltrados = (clientes || []).filter((cliente) =>
    (cliente.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (cliente.email || '').toLowerCase().includes(busca.toLowerCase())
  )

  // Verificar se está vazio
  const isVazio = !clientes || clientes.length === 0

  // Renderizar badge de status
  const renderStatusBadge = (status: SubcontaCliente['status']) => {
    const isAtivo = !status || status === 'ativo'
    const isPendente = status === 'pendente'
    const isInativo = status === 'inativo'

    return (
      <Badge variant={isAtivo ? 'default' : isPendente ? 'secondary' : 'outline'}>
        {isAtivo ? 'Ativo' : isPendente ? 'Aguardando' : 'Inativo'}
      </Badge>
    )
  }

  // Formatar data de cadastro
  const formatarDataCadastro = (created_at: SubcontaCliente['created_at']) => {
    if (!created_at) return '—'
    return new Date(created_at).toLocaleDateString('pt-BR')
  }

  function handleAcessar(cliente: SubcontaCliente) {
    // Por enquanto redireciona para /controle-anual
    // B07 vai implementar subconta real com impersonação
    router.push('/controle-anual')
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Painel do Educador</h1>
        <p className="text-muted-foreground">Gerencie seus clientes</p>
      </div>

      {/* Estado vazio */}
      {isVazio ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground text-center">
            Você ainda não tem clientes. Crie uma subconta para começar.
          </p>
        </div>
      ) : (
        <>
          {/* Barra de busca */}
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

          {/* Tabela de clientes */}
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Membro desde</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhum cliente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientesFiltrados.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">
                          {cliente.nome || 'Sem nome'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {cliente.email || '—'}
                        </TableCell>
                        <TableCell>
                          {formatarDataCadastro(cliente.created_at)}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(cliente.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcessar(cliente)}
                          >
                            Acessar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
