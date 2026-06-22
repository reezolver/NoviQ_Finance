"use client"

import * as React from "react"
import { LogOut, Users, UserCircle } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase"
import { virarGestor } from "@/app/actions/onboarding"
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
 *
 * `preferenciaInicial` controla o item **"Gerenciar clientes"** (Spec 17 · RF-11):
 * só aparece no modo pessoal (`=== 'pessoal'`), onde permite o auto-upgrade
 * pessoal → gestor (sem mudança de papel — só preferência) e leva ao `/painel`.
 */
export function MenuUsuario({
  nome,
  email,
  preferenciaInicial,
}: {
  nome?: string | null
  email?: string | null
  preferenciaInicial?: "pessoal" | "gestor" | null
}) {
  const [saindo, setSaindo] = React.useState(false)
  const [virando, setVirando] = React.useState(false)

  const sair = React.useCallback(async () => {
    setSaindo(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }, [])

  const tornarGestor = React.useCallback(async () => {
    setVirando(true)
    try {
      await virarGestor()
      window.location.href = "/painel"
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível ativar a gestão de clientes."
      )
      setVirando(false)
    }
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
        {preferenciaInicial === "pessoal" ? (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              void tornarGestor()
            }}
            disabled={virando}
            className="gap-2"
          >
            <Users />
            {virando ? "Ativando…" : "Gerenciar clientes"}
          </DropdownMenuItem>
        ) : null}
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
