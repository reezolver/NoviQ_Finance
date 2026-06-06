'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, UserPlus, Eye } from 'lucide-react'

// Dados mockados dos educadores
const EDUCADORES_MOCKADOS = [
  {
    id: '1',
    nome: 'Carlos Silva',
    email: 'carlos.silva@email.com',
    clientesVinculados: 25,
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'Ana Santos',
    email: 'ana.santos@email.com',
    clientesVinculados: 18,
    status: 'ativo',
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    clientesVinculados: 32,
    status: 'ativo',
  },
  {
    id: '4',
    nome: 'Juliana Costa',
    email: 'juliana.costa@email.com',
    clientesVinculados: 12,
    status: 'inativo',
  },
]

// Dados mockados de clientes por educador
const CLIENTES_POR_EDUCADOR: Record<string, string[]> = {
  '1': ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Lima'],
  '2': ['Lucas Oliveira', 'Beatriz Costa', 'Gabriel Silva', 'Fernanda Santos', 'Rafael Lima'],
  '3': ['Marcos Souza', 'Camila Oliveira', 'Bruno Silva', 'Larissa Costa', 'Felipe Santos'],
  '4': ['Gustavo Lima', 'Lívia Silva', 'Rafael Costa', 'Manuela Santos', 'Enzo Oliveira'],
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function MasterPage() {
  const [selectedEducador, setSelectedEducador] = useState<typeof EDUCADORES_MOCKADOS[0] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleVerClientes = (educador: typeof EDUCADORES_MOCKADOS[0]) => {
    setSelectedEducador(educador)
    setDialogOpen(true)
  }

  const clientesDoEducador = selectedEducador
    ? CLIENTES_POR_EDUCADOR[selectedEducador.id] || []
    : []

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel Master</h1>
        <p className="text-muted-foreground">Visão geral da plataforma</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Educadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {EDUCADORES_MOCKADOS.filter((e) => e.status === 'ativo').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Educadores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {EDUCADORES_MOCKADOS.reduce((sum, e) => sum + e.clientesVinculados, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes vinculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {EDUCADORES_MOCKADOS.length +
                EDUCADORES_MOCKADOS.reduce((sum, e) => sum + e.clientesVinculados, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Educadores + Clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Educadores */}
      <Card>
        <CardHeader>
          <CardTitle>Educadores</CardTitle>
          <CardDescription>Gerencie os educadores e seus clientes vinculados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right">Clientes Vinculados</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EDUCADORES_MOCKADOS.map((educador) => (
                  <TableRow key={educador.id}>
                    <TableCell className="font-medium">{educador.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{educador.email}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {educador.clientesVinculados} clientes
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={educador.status === 'ativo' ? 'default' : 'secondary'}>
                        {educador.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerClientes(educador)}
                      >
                        <Eye className="size-4 mr-2" />
                        Ver clientes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Clientes do Educador */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="text-lg">
                  {selectedEducador ? getInitials(selectedEducador.nome) : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">
                  {selectedEducador?.nome || 'Educador'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedEducador?.clientesVinculados || 0} clientes vinculados
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {clientesDoEducador.length > 0 ? (
              clientesDoEducador.map((cliente, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(cliente)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{cliente}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum cliente vinculado a este educador.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
