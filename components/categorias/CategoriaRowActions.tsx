"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { removerCategoria } from "@/app/actions/categorias"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CategoriaModal,
  type CategoriaExistente,
} from "@/components/categorias/CategoriaModal"

/**
 * Ações de uma linha de categoria: editar (reabre o {@link CategoriaModal} em
 * modo edição) e remover (bloqueado no servidor se houver lançamentos). Client
 * porque dispara Server Actions e controla o estado do menu/modal.
 */
export function CategoriaRowActions({
  subcontaId,
  categoria,
}: {
  subcontaId: string
  categoria: CategoriaExistente
}) {
  const router = useRouter()
  const [editarAberto, setEditarAberto] = React.useState(false)
  const [removendo, setRemovendo] = React.useState(false)

  async function remover() {
    setRemovendo(true)
    try {
      await removerCategoria(subcontaId, categoria.id)
      toast.success("Categoria removida.")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível remover a categoria."
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
            aria-label={`Ações da categoria ${categoria.nome}`}
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

      <CategoriaModal
        subcontaId={subcontaId}
        categoria={categoria}
        open={editarAberto}
        onOpenChange={setEditarAberto}
      />
    </>
  )
}
