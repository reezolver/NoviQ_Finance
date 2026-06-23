"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

import { assumirCliente } from "@/app/actions/subcontas"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface GestorDestino {
  id: string
  nome: string
}

/**
 * Ação "Assumir cliente" do **pool de não atribuídos** (Spec 21 · RF-5a.3) —
 * só master. Lista os destinos possíveis (o próprio master + os educadores) e
 * dispara `assumirCliente`, que reatribui `gestor_id`. A action revalida o papel
 * master no servidor.
 */
export function PoolClienteActions({
  subcontaId,
  destinos,
}: {
  subcontaId: string
  destinos: GestorDestino[]
}) {
  const router = useRouter()
  const [assumindo, setAssumindo] = React.useState(false)

  async function assumir(novoGestorId: string) {
    setAssumindo(true)
    try {
      await assumirCliente(subcontaId, novoGestorId)
      toast.success("Cliente atribuído.")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível atribuir o cliente."
      )
    } finally {
      setAssumindo(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={assumindo}>
          <UserPlus />
          Assumir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Atribuir a</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {destinos.length === 0 ? (
          <DropdownMenuItem disabled>Nenhum gestor disponível</DropdownMenuItem>
        ) : (
          destinos.map((g) => (
            <DropdownMenuItem
              key={g.id}
              disabled={assumindo}
              onSelect={(evento) => {
                evento.preventDefault()
                void assumir(g.id)
              }}
            >
              {g.nome}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
