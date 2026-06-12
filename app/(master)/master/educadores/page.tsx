'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Search, Check, X, AlertCircle, Mail, Copy, Eye, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface Educador {
  id: string
  nome: string
  status: 'ativo' | 'pendente' | 'inativo'
  created_at: string
}

export default function EducadoresPage() {
  const [loading, setLoading] = useState(true)
  const [educadores, setEducadores] = useState<Educador[]>([])
  const [busca, setBusca] = useState('')
  const [tabAtiva, setTabAtiva] = useState('pendentes')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [educadorSelecionado, setEducadorSelecionado] = useState<Educador | null>(null)
  const [acaoDialog, setAcaoDialog] = useState<'aprovar' | 'recusar' | 'desativar' | 'reativar' | null>(null)
  const [conviteDialogAberto, setConviteDialogAberto] = useState(false)
  const [detalhesDialogAberto, setDetalhesDialogAberto] = useState(false)
  const [clientesCount, setClientesCount] = useState<number>(0)

  // Buscar educadores
  useEffect(() => {
    async function fetchEducadores() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('tipo_perfil', 'educador')
          .order('created_at', { ascending: false })

        if (error) throw error

        setEducadores(data || [])
      } catch (error) {
        console.error('Erro ao buscar educadores:', error)
        toast.error('Erro ao carregar educadores.')
      } finally {
        setLoading(false)
      }
    }

    fetchEducadores()
  }, [])

  // Filtrar educadores por busca
  const educadoresFiltrados = educadores.filter((edu) => {
    const buscaLower = busca.toLowerCase()
    return (edu.nome || '').toLowerCase().includes(buscaLower)
  })

  // Separar por status
  const pendentes = educadoresFiltrados.filter((e) => e.status === 'pendente')
  const ativos = educadoresFiltrados.filter((e) => e.status === 'ativo')
  const inativos = educadoresFiltrados.filter((e) => e.status === 'inativo')

  // Abrir dialog de confirmação
  function abrirConfirmacao(educador: Educador, acao: 'aprovar' | 'recusar' | 'desativar' | 'reativar') {
    setEducadorSelecionado(educador)
    setAcaoDialog(acao)
    setDialogAberto(true)
  }

  // Abrir modal de detalhes
  async function abrirDetalhes(educador: Educador) {
    setEducadorSelecionado(educador)
    setDetalhesDialogAberto(true)

    // Buscar número de clientes vinculados
    try {
      const supabase = createClient()
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_perfil', 'cliente')
        .eq('educador_id', educador.id)

      setClientesCount(count || 0)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      setClientesCount(0)
    }
  }

  // Executar ação
  async function executarAcao() {
    if (!educadorSelecionado || !acaoDialog) return

    try {
      const supabase = createClient()

      let novoStatus: string
      let mensagemSucesso: string

      switch (acaoDialog) {
        case 'aprovar':
          novoStatus = 'ativo'
          mensagemSucesso = 'Educador aprovado com sucesso!'
          break
        case 'recusar':
          novoStatus = 'inativo'
          mensagemSucesso = 'Educador recusado.'
          break
        case 'desativar':
          novoStatus = 'inativo'
          mensagemSucesso = 'Educador desativado.'
          break
        case 'reativar':
          novoStatus = 'ativo'
          mensagemSucesso = 'Educador reativado com sucesso!'
          break
        default:
          return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ status: novoStatus })
        .eq('id', educadorSelecionado.id)

      if (error) throw error

      // Atualizar lista
      const { data: educadoresAtualizados } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_perfil', 'educador')
        .order('created_at', { ascending: false })

      setEducadores(educadoresAtualizados || [])

      toast.success(mensagemSucesso)
      setDialogAberto(false)
      setEducadorSelecionado(null)
      setAcaoDialog(null)
    } catch (error) {
      console.error('Erro ao executar ação:', error)
      toast.error('Erro ao executar ação. Tente novamente.')
    }
  }

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

  // Copiar link de convite
  function copiarLinkConvite() {
    const link = 'https://novi-q-finance.vercel.app/cadastro'
    navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-muted-foreground">Carregando educadores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Educadores</h1>
          <p className="text-muted-foreground mt-2">
            Aprove, recuse ou gerencie os educadores da plataforma
          </p>
        </div>
        <Button onClick={() => setConviteDialogAberto(true)}>
          <Mail className="h-4 w-4 mr-2" />
          Convidar Educador
        </Button>
      </div>

      {/* Card com Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Educadores</CardTitle>
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

          {/* Tabs */}
          <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pendentes">
                Pendentes ({pendentes.length})
              </TabsTrigger>
              <TabsTrigger value="ativos">
                Ativos ({ativos.length})
              </TabsTrigger>
              <TabsTrigger value="inativos">
                Inativos ({inativos.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab Pendentes */}
            <TabsContent value="pendentes" className="mt-4">
              {pendentes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum educador pendente de aprovação.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendentes.map((edu) => (
                      <TableRow key={edu.id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => abrirDetalhes(edu)}
                            className="hover:text-primary hover:underline text-left"
                          >
                            {edu.nome || 'Sem nome'}
                          </button>
                        </TableCell>
                        <TableCell>{formatarData(edu.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirConfirmacao(edu, 'aprovar')}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirConfirmacao(edu, 'recusar')}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Recusar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab Ativos */}
            <TabsContent value="ativos" className="mt-4">
              {ativos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum educador ativo no momento.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ativos.map((edu) => (
                      <TableRow key={edu.id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => abrirDetalhes(edu)}
                            className="hover:text-primary hover:underline text-left"
                          >
                            {edu.nome || 'Sem nome'}
                          </button>
                        </TableCell>
                        <TableCell>
                          <BadgeStatus status={edu.status} />
                        </TableCell>
                        <TableCell>{formatarData(edu.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirConfirmacao(edu, 'desativar')}
                          >
                            Desativar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab Inativos */}
            <TabsContent value="inativos" className="mt-4">
              {inativos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum educador inativo no momento.
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
                    {inativos.map((edu) => (
                      <TableRow key={edu.id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => abrirDetalhes(edu)}
                            className="hover:text-primary hover:underline text-left"
                          >
                            {edu.nome || 'Sem nome'}
                          </button>
                        </TableCell>
                        <TableCell>
                          <BadgeStatus status={edu.status} />
                        </TableCell>
                        <TableCell>{formatarData(edu.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Confirmar Ação
            </DialogTitle>
            <DialogDescription>
              {acaoDialog === 'aprovar' && (
                <>Deseja aprovar o educador <strong>{educadorSelecionado?.nome}</strong>?</>
              )}
              {acaoDialog === 'recusar' && (
                <>Deseja recusar o educador <strong>{educadorSelecionado?.nome}</strong>?</>
              )}
              {acaoDialog === 'desativar' && (
                <>Deseja desativar o educador <strong>{educadorSelecionado?.nome}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={executarAcao}
              className={
                acaoDialog === 'aprovar'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {acaoDialog === 'aprovar' ? 'Aprovar' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Convite */}
      <Dialog open={conviteDialogAberto} onOpenChange={setConviteDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Convidar Educador
            </DialogTitle>
            <DialogDescription>
              Compartilhe o link abaixo para o educador se cadastrar na plataforma:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              readOnly
              value="https://novi-q-finance.vercel.app/cadastro"
              className="bg-muted"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConviteDialogAberto(false)}>
              Fechar
            </Button>
            <Button onClick={copiarLinkConvite}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes do Educador */}
      <Dialog open={detalhesDialogAberto} onOpenChange={setDetalhesDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Detalhes do Educador
            </DialogTitle>
            <DialogDescription>
              Informações completas do educador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Nome</Label>
              <p className="font-medium">{educadorSelecionado?.nome || 'Sem nome'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">E-mail</Label>
              <p className="text-muted-foreground">Não disponível</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Status</Label>
              {educadorSelecionado && <BadgeStatus status={educadorSelecionado.status} />}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Data de Cadastro</Label>
              <p className="text-muted-foreground">
                {educadorSelecionado && formatarData(educadorSelecionado.created_at)}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Clientes Vinculados</Label>
              <p className="font-medium text-2xl">{clientesCount}</p>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setDetalhesDialogAberto(false)}>
              Fechar
            </Button>
            <div className="flex gap-2">
              {educadorSelecionado?.status === 'pendente' && (
                <>
                  <Button
                    onClick={() => {
                      setDetalhesDialogAberto(false)
                      abrirConfirmacao(educadorSelecionado, 'aprovar')
                    }}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetalhesDialogAberto(false)
                      abrirConfirmacao(educadorSelecionado, 'recusar')
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Recusar
                  </Button>
                </>
              )}
              {educadorSelecionado?.status === 'ativo' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetalhesDialogAberto(false)
                    abrirConfirmacao(educadorSelecionado, 'desativar')
                  }}
                >
                  Desativar
                </Button>
              )}
              {educadorSelecionado?.status === 'inativo' && (
                <Button
                  onClick={() => {
                    setDetalhesDialogAberto(false)
                    abrirConfirmacao(educadorSelecionado, 'reativar')
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reativar
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
