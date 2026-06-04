/**
 * Painel do Educador
 *
 * Tela exclusiva para educadores financeiros gerenciarem seus clientes.
 * Permite buscar, visualizar e acessar as contas dos clientes.
 */

"use client"

import { useState } from "react"
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
import { type Cliente } from "@/types/financeiro"
import { toast } from "sonner"

// ─── Dados Mockados ─────────────────────────────────────────────────────────────

const CLIENTES_MOCKADOS: Cliente[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@email.com",
    ultimoAcesso: "Hoje",
    status: "ativo",
  },
  {
    id: "2",
    nome: "Maria Santos",
    email: "maria@email.com",
    ultimoAcesso: "Ontem",
    status: "ativo",
  },
  {
    id: "3",
    nome: "Pedro Costa",
    email: "pedro@email.com",
    ultimoAcesso: "3 dias atrás",
    status: "ativo",
  },
  {
    id: "4",
    nome: "Ana Oliveira",
    email: "ana@email.com",
    ultimoAcesso: "1 semana atrás",
    status: "inativo",
  },
  {
    id: "5",
    nome: "Carlos Lima",
    email: "carlos@email.com",
    ultimoAcesso: "2 semanas atrás",
    status: "inativo",
  },
]

// ─── Componente Principal ─────────────────────────────────────────────────────────

export default function PainelPage() {
  const [busca, setBusca] = useState("")

  // Filtrar clientes por nome
  const clientesFiltrados = CLIENTES_MOCKADOS.filter((cliente) =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase())
  )

  function handleAcessar(cliente: Cliente) {
    toast.info(`Funcionalidade de impersonação em breve para: ${cliente.nome}`)
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Painel do Educador</h1>
        <p className="text-muted-foreground">Gerencie seus clientes</p>
      </div>

      {/* Barra de busca */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabela de clientes */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Último acesso</TableHead>
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
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{cliente.email}</TableCell>
                  <TableCell>{cliente.ultimoAcesso}</TableCell>
                  <TableCell>
                    <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
                      {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
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
  )
}
