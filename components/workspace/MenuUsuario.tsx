"use client"

import * as React from "react"
import { LogOut, UserCircle } from "lucide-react"

import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Menu da conta no cabeçalho — hoje com a ação **Sair**. Desloga via client de
 * browser (`signOut`, mesmo client do login) e recarrega para `/login`. O reload
 * completo garante que o cookie de sessão limpo chegue ao servidor antes do
 * próximo roteamento (espelha o fluxo de login).
 *
 * `nome`/`email` são opcionais: quando vêm, identificam a conta logada no topo
 * do menu.
 */
export function MenuUsuario({
  nome,
  email,
}: {
  nome?: string | null
  email?: string | null
}) {
  const [saindo, setSaindo] = React.useState(false)

  const sair = React.useCallback(async () => {
    setSaindo(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }, [])

  const titulo = nome?.trim() || email?.trim() || "Minha conta"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Conta"
        >
          <UserCircle className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium">{titulo}</span>
          {email && nome ? (
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            // Evita o fechamento padrão fechar antes do signOut assíncrono.
            e.preventDefault()
            void sair()
          }}
          disabled={saindo}
          className="gap-2"
        >
          <LogOut />
          {saindo ? "Saindo…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
