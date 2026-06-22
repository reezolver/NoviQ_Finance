"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { removerPatrimonio } from "@/app/actions/patrimonio"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PatrimonioModal,
  type PatrimonioExistente,
} from "@/components/investimentos/PatrimonioModal"

/**
 * Ações da linha de um ativo (Spec 09): editar (reabre o {@link PatrimonioModal}
 * em modo edição) e remover. Client porque dispara Server Actions e controla o
 * estado do menu/modal.
 */
export function PatrimonioRowActions({
  subcontaId,
  ativo,
}: {
  subcontaId: string
  ativo: PatrimonioExistente
}) {
  const router = useRouter()
  const [editarAberto, setEditarAberto] = React.useState(false)
  const [removendo, setRemovendo] = React.useState(false)

  async function remover() {
    setRemovendo(true)
    try {
      await removerPatrimonio(subcontaId, ativo.id)
      toast.success("Ativo removido.")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível remover o ativo."
      )
    } finally {
      setRemovendo(false)
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
            aria-label="Ações do ativo"
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditarAberto(true)}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={removendo}
            onSelect={(e) => {
              e.preventDefault()
              void remover()
            }}
          >
            <Trash2 />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PatrimonioModal
        subcontaId={subcontaId}
        ativo={ativo}
        open={editarAberto}
        onOpenChange={setEditarAberto}
      />
    </>
  )
}
