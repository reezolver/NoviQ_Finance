"use client"

import * as React from "react"
import { LogOut } from "lucide-react"

import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

/**
 * Botão de logout reutilizável (Spec 17 · RF-9). Desloga via client de browser
 * (`signOut`) e recarrega para `/login` — o reload completo garante que o cookie
 * de sessão limpo chegue ao servidor antes do próximo roteamento (mesmo padrão do
 * `MenuUsuario`). Usado em telas de "limbo" como `/onboarding`, onde o usuário
 * pode querer trocar de conta sem ficar preso.
 */
export function LogoutButton({
  variant = "ghost",
  className,
}: {
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
}) {
  const [saindo, setSaindo] = React.useState(false)

  const sair = React.useCallback(async () => {
    setSaindo(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }, [])

  return (
    <Button
      variant={variant}
      size="sm"
      className={className}
      disabled={saindo}
      onClick={() => void sair()}
    >
      <LogOut />
      {saindo ? "Saindo…" : "Sair"}
    </Button>
  )
}
