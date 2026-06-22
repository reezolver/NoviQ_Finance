"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRightLeft, MoreVertical } from "lucide-react"
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

export interface EducadorOpcao {
  id: string
  nome: string
}

/**
 * Ações por linha de cliente no painel — **só master** (Spec 07): mover o
 * cliente para outro gestor. Lista os educadores disponíveis e dispara
 * `moverCliente`; a action valida o papel master e que o novo gestor existe
 * (cliente nunca fica órfão). Não exibe o gestor atual como opção de destino.
 */
export function ClienteRowActions({
  subcontaId,
  gestorAtualId,
  educadores,
}: {
  subcontaId: string
  gestorAtualId: string
  educadores: EducadorOpcao[]
}) {
  const router = useRouter()
  const [movendo, setMovendo] = React.useState(false)

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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
