'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, UserPlus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface Cliente {
  id: string
  nome: string
  status: string
  created_at: string
}

export default function ClientesPage() {
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [addClienteDialogAberto, setAddClienteDialogAberto] = useState(false)
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    email: '',
    senha: '',
  })

  // Buscar clientes
  useEffect(() => {
    async function fetchClientes() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('tipo_perfil', 'cliente')
          .order('created_at', { ascending: false })

        if (error) throw error

        setClientes(data || [])
      } catch (error) {
        console.error('Erro ao buscar clientes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

  // Filtrar clientes por busca
  const clientesFiltrados = clientes.filter((cli) => {
    const buscaLower = busca.toLowerCase()
    return cli.nome.toLowerCase().includes(buscaLower)
  })

  // Formatar data
  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  // Badge de status
  function BadgeStatus({ status }: { status: string }) {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
      case 'pendente':
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">Pendente</Badge>
        )
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Adicionar novo cliente (placeholder)
  function handleAdicionarCliente() {
    toast.success('Funcionalidade em desenvolvimento')
    setAddClienteDialogAberto(false)
    setNovoCliente({ nome: '', email: '', senha: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Visualize todos os clientes cadastrados na plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddClienteDialogAberto(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Cliente
          </Button>
          <Button variant="outline" disabled title="Em breve">
            <FileText className="h-4 w-4 mr-2" />
            Enviar Anamnese
          </Button>
        </div>
      </div>

      {/* Card com Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes ({clientesFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Campo de busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela */}
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {busca
                ? 'Nenhum cliente encontrado com essa busca.'
                : 'Nenhum cliente cadastrado ainda.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>
                      <BadgeStatus status={cliente.status} />
                    </TableCell>
                    <TableCell>{formatarData(cliente.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Adicionar Cliente */}
      <Dialog open={addClienteDialogAberto} onOpenChange={setAddClienteDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Adicionar Cliente
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para adicionar um novo cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={novoCliente.nome}
                onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={novoCliente.email}
                onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                placeholder="cliente@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha temporária</Label>
              <Input
                id="senha"
                type="password"
                value={novoCliente.senha}
                onChange={(e) => setNovoCliente({ ...novoCliente, senha: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddClienteDialogAberto(false)
              setNovoCliente({ nome: '', email: '', senha: '' })
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarCliente} disabled={!novoCliente.nome || !novoCliente.email || !novoCliente.senha}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
