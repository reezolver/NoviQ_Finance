"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/**
 * **Menu avançado** (conceito de UX do MVP — estilo Photoshop "Essencial ×
 * Avançado"): a visão padrão é **mínima** e discreta; um toggle revela as
 * funções extras sem poluir a tela do cliente.
 *
 * Aqui aplicado à tela de Investimentos: por padrão mostra só os derivados
 * (Patrimônio Líquido + Reserva). Ao ligar "Avançado", revela a carteira
 * completa, distribuição, resumo por finalidade e o CRUD (`children`).
 *
 * Client Component: guarda o estado do toggle e renderiza os `children`
 * (montados no servidor) condicionalmente.
 */
export function ModoAvancado({ children }: { children: React.ReactNode }) {
  const [avancado, setAvancado] = React.useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <SlidersHorizontal
          className="size-4 text-muted-foreground"
          aria-hidden
        />
        <Label htmlFor="modo-avancado" className="text-sm text-muted-foreground">
          Modo avançado
        </Label>
        <Switch
          id="modo-avancado"
          checked={avancado}
          onCheckedChange={setAvancado}
          aria-label="Alternar modo avançado"
        />
      </div>

      {avancado ? (
        <div className="space-y-6">{children}</div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Ative o <span className="font-medium text-foreground">modo avançado</span>{" "}
          para ver a carteira completa, a distribuição por categoria e gerenciar
          ativos e dívidas.
        </p>
      )}
    </div>
  )
}
