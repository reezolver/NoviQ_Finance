"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { restaurarCliente } from "@/app/actions/subcontas"
import { Button } from "@/components/ui/button"

/**
 * Botão "Restaurar" da lixeira (Spec 21 · RF-5c.3): tira o cliente de
 * `deleted_at`, reativa o login e o traz de volta às listas. A action revalida
 * posse/papel no servidor.
 */
export function RestaurarClienteButton({ subcontaId }: { subcontaId: string }) {
  const router = useRouter()
  const [restaurando, setRestaurando] = React.useState(false)

  async function restaurar() {
    setRestaurando(true)
    try {
      await restaurarCliente(subcontaId)
      toast.success("Cliente restaurado.")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível restaurar o cliente."
      )
    } finally {
      setRestaurando(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={restaurando}
      onClick={() => void restaurar()}
    >
      <RotateCcw />
      {restaurando ? "Restaurando…" : "Restaurar"}
    </Button>
  )
}
