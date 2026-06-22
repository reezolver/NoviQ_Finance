"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Check, ChevronsUpDown, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database"

type TipoSubconta = Database["public"]["Enums"]["tipo_subconta"]

export interface SubcontaAcessivel {
  id: string
  nome: string
  tipo: TipoSubconta
}

/**
 * **Seletor de subconta** (Spec 07) — a UX "trocar de conta estilo Instagram".
 * É **contexto de workspace, não troca de sessão**: o gestor continua logado
 * como ele mesmo; selecionar uma subconta apenas troca o `[subcontaId]` da URL,
 * preservando a seção atual (controle anual, mensal, etc.).
 *
 * A lista já chega filtrada pela RLS (a pessoal do gestor + os clientes
 * acessíveis). Para o cliente final — que só enxerga a própria subconta —
 * exibe um rótulo estático, sem dropdown.
 */
export function SeletorSubconta({
  subcontas,
  subcontaAtivaId,
}: {
  subcontas: SubcontaAcessivel[]
  subcontaAtivaId: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const ativa =
    subcontas.find((s) => s.id === subcontaAtivaId) ?? subcontas[0] ?? null

  const trocar = React.useCallback(
    (novoId: string) => {
      if (novoId === subcontaAtivaId) return
      // Preserva a seção atual (segmentos após o `[subcontaId]`).
      const resto = pathname.split("/").filter(Boolean).slice(1)
      router.push(`/${[novoId, ...resto].join("/")}`)
    },
    [pathname, router, subcontaAtivaId]
  )

  if (!ativa) return null

  const podeTrocar = subcontas.length > 1
  const pessoais = subcontas.filter((s) => s.tipo === "pessoal")
  const clientes = subcontas.filter((s) => s.tipo === "cliente")

  if (!podeTrocar) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium text-foreground">{ativa.nome}</span>
        <Badge variant="secondary" className="capitalize">
          {ativa.tipo}
        </Badge>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 min-w-0 gap-2 px-2"
          aria-label="Trocar de subconta"
        >
          {ativa.tipo === "pessoal" ? (
            <User className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <Users className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-medium">{ativa.nome}</span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        {pessoais.length > 0 && (
          <>
            <DropdownMenuLabel>Conta pessoal</DropdownMenuLabel>
            {pessoais.map((s) => (
              <ItemSubconta
                key={s.id}
                subconta={s}
                ativa={s.id === ativa.id}
                onSelect={() => trocar(s.id)}
              />
            ))}
          </>
        )}
        {clientes.length > 0 && (
          <>
            {pessoais.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>Clientes</DropdownMenuLabel>
            {clientes.map((s) => (
              <ItemSubconta
                key={s.id}
                subconta={s}
                ativa={s.id === ativa.id}
                onSelect={() => trocar(s.id)}
              />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ItemSubconta({
  subconta,
  ativa,
  onSelect,
}: {
  subconta: SubcontaAcessivel
  ativa: boolean
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem onSelect={onSelect} className="gap-2">
      {subconta.tipo === "pessoal" ? (
        <User className="size-4 text-muted-foreground" />
      ) : (
        <Users className="size-4 text-muted-foreground" />
      )}
      <span className="truncate">{subconta.nome}</span>
      <Check
        className={cn("ml-auto size-4", ativa ? "opacity-100" : "opacity-0")}
      />
    </DropdownMenuItem>
  )
}
