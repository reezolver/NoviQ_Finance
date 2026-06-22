"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { removerObjetivo } from "@/app/actions/objetivos"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ObjetivoModal, type ObjetivoExistente } from "@/components/objetivos/ObjetivoModal"

/**
 * Ações do card de objetivo (Spec 06): editar (reabre o {@link ObjetivoModal} em
 * modo edição) e remover. Componente client porque dispara Server Actions e
 * controla o estado do menu/modal.
 */
export function ObjetivoCardActions({
  subcontaId,
  objetivo,
}: {
  subcontaId: string
  objetivo: ObjetivoExistente
}) {
  const router = useRouter()
  const [editarAberto, setEditarAberto] = React.useState(false)
  const [removendo, setRemovendo] = React.useState(false)

  async function remover() {
    setRemovendo(true)
    try {
      await removerObjetivo(subcontaId, objetivo.id)
      toast.success("Objetivo removido.")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível remover o objetivo."
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
            aria-label="Ações do objetivo"
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

      {/* Modal de edição controlado pelo item do menu. */}
      <ObjetivoModal
        subcontaId={subcontaId}
        objetivo={objetivo}
        open={editarAberto}
        onOpenChange={setEditarAberto}
      />
    </>
  )
}
