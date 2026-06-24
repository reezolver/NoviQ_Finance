"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, ShieldCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { promoverParaMaster, excluirEducador } from "@/app/actions/educadores"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Ações por linha de educador no painel de Educadores (master) — **promover a
 * master** e **excluir educador**. Ambas pedem confirmação num diálogo fora do
 * dropdown (não desmonta ao fechar o menu). A permissão real vive nas actions
 * (`assertMaster`) + RLS; aqui é só UX.
 *
 * Excluir reusa `purgarContaPropria` no servidor: as carteiras pessoais e o
 * login do educador somem; os **clientes** dele caem no pool "Não atribuídos".
 */
export function EducadorRowActions({
  educadorId,
  nome,
  qtdClientes,
}: {
  educadorId: string
  nome: string
  qtdClientes: number
}) {
  const router = useRouter()
  const [promoverOpen, setPromoverOpen] = React.useState(false)
  const [excluirOpen, setExcluirOpen] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)
  const [confirmacao, setConfirmacao] = React.useState("")

  // Limpa o campo de confirmação sempre que o diálogo de excluir abre.
  const chave = excluirOpen ? educadorId : null
  const chaveAnterior = React.useRef<string | null>(null)
  if (chave !== chaveAnterior.current) {
    chaveAnterior.current = chave
    if (excluirOpen) setConfirmacao("")
  }

  const nomeConfere =
    confirmacao.trim().toLowerCase() === nome.trim().toLowerCase()

  async function promover() {
    if (enviando) return
    setEnviando(true)
    try {
      await promoverParaMaster(educadorId)
      toast.success(`${nome} agora é master.`)
      setPromoverOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível promover."
      )
    } finally {
      setEnviando(false)
    }
  }

  async function excluir() {
    if (!nomeConfere || enviando) return
    setEnviando(true)
    try {
      await excluirEducador(educadorId)
      toast.success(`${nome} foi excluído.`)
      setExcluirOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível excluir."
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label={`Ações de ${nome}`}
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              setPromoverOpen(true)
            }}
          >
            <ShieldCheck className="size-4" />
            Promover a master
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault()
              setExcluirOpen(true)
            }}
          >
            <Trash2 className="size-4" />
            Excluir educador
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Promover a master */}
      <Dialog open={promoverOpen} onOpenChange={setPromoverOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Promover {nome} a master?</DialogTitle>
            <DialogDescription>
              {nome} passará a ter acesso de master — vê e gerencia clientes,
              educadores e anamneses de toda a plataforma. Para o novo acesso
              valer por completo, a pessoa precisa sair e entrar de novo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPromoverOpen(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void promover()}
              disabled={enviando}
            >
              {enviando ? "Promovendo…" : "Promover a master"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir educador */}
      <Dialog open={excluirOpen} onOpenChange={setExcluirOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir {nome}</DialogTitle>
            <DialogDescription>
              Apaga as contas pessoais e o login de {nome}, sem volta.
              {qtdClientes > 0
                ? ` Os ${qtdClientes} cliente(s) dele(a) não são apagados: vão para "Não atribuídos", para você reatribuir.`
                : " Esta pessoa não tem clientes."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="confirma-educador" className="text-sm">
              Digite <span className="font-semibold">{nome}</span> para confirmar
            </Label>
            <Input
              id="confirma-educador"
              autoComplete="off"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder={nome}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setExcluirOpen(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void excluir()}
              disabled={!nomeConfere || enviando}
            >
              {enviando ? "Excluindo…" : "Excluir para sempre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
