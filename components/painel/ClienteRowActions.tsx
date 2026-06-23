"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRightLeft, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { moverCliente } from "@/app/actions/subcontas"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RenomearContaDialog } from "@/components/workspace/RenomearContaDialog"
import { ExcluirClienteDialog } from "@/components/painel/ExcluirClienteDialog"

export interface EducadorOpcao {
  id: string
  nome: string
}

/**
 * Ações por linha de cliente no painel (Spec 21 · RF-5.1): **renomear** e
 * **excluir** disponíveis ao gestor dono (educador) e ao master; **mover para
 * gestor** (Spec 07) só ao master. Cada action revalida papel/posse no servidor
 * + RLS — aqui é só UX. Os diálogos vivem fora do dropdown (não desmontam ao
 * fechar o menu).
 */
export function ClienteRowActions({
  subcontaId,
  nomeAtual,
  gestorAtualId,
  isMaster,
  educadores,
}: {
  subcontaId: string
  nomeAtual: string
  gestorAtualId: string | null
  isMaster: boolean
  educadores: EducadorOpcao[]
}) {
  const router = useRouter()
  const [movendo, setMovendo] = React.useState(false)
  const [renomearOpen, setRenomearOpen] = React.useState(false)
  const [excluirOpen, setExcluirOpen] = React.useState(false)

  const destinos = educadores.filter((e) => e.id !== gestorAtualId)

  async function mover(novoGestorId: string) {
    setMovendo(true)
    try {
      await moverCliente(subcontaId, novoGestorId)
      toast.success("Cliente movido para outro gestor.")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível mover o cliente."
      )
    } finally {
      setMovendo(false)
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
            aria-label="Ações do cliente"
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onSelect={(evento) => {
              evento.preventDefault()
              setRenomearOpen(true)
            }}
          >
            <Pencil className="size-4" />
            Renomear cliente
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(evento) => {
              evento.preventDefault()
              setExcluirOpen(true)
            }}
          >
            <Trash2 className="size-4" />
            Excluir cliente
          </DropdownMenuItem>

          {isMaster && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2">
                <ArrowRightLeft className="size-4" />
                Mover para gestor
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {destinos.length === 0 ? (
                <DropdownMenuItem disabled>Nenhum outro gestor</DropdownMenuItem>
              ) : (
                destinos.map((e) => (
                  <DropdownMenuItem
                    key={e.id}
                    disabled={movendo}
                    onSelect={(evento) => {
                      evento.preventDefault()
                      void mover(e.id)
                    }}
                  >
                    {e.nome}
                  </DropdownMenuItem>
                ))
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fora do dropdown para não desmontar ao fechar o menu. */}
      <RenomearContaDialog
        subcontaId={subcontaId}
        nomeAtual={nomeAtual}
        rotulo="Renomear cliente"
        open={renomearOpen}
        onOpenChange={setRenomearOpen}
      />
      <ExcluirClienteDialog
        subcontaId={subcontaId}
        nomeAtual={nomeAtual}
        open={excluirOpen}
        onOpenChange={setExcluirOpen}
      />
    </>
  )
}
