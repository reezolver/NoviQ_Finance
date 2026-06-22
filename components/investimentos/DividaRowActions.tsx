"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { removerDivida } from "@/app/actions/dividas"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DividaModal,
  type DividaExistente,
} from "@/components/investimentos/DividaModal"

/**
 * Ações da linha de uma dívida (Spec 09): editar e remover. Client porque
 * dispara Server Actions e controla o estado do menu/modal.
 */
export function DividaRowActions({
  subcontaId,
  divida,
}: {
  subcontaId: string
  divida: DividaExistente
}) {
  const router = useRouter()
  const [editarAberto, setEditarAberto] = React.useState(false)
  const [removendo, setRemovendo] = React.useState(false)

  async function remover() {
    setRemovendo(true)
    try {
      await removerDivida(subcontaId, divida.id)
      toast.success("Dívida removida.")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível remover a dívida."
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
            aria-label="Ações da dívida"
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

      <DividaModal
        subcontaId={subcontaId}
        divida={divida}
        open={editarAberto}
        onOpenChange={setEditarAberto}
      />
    </>
  )
}
