import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * **Card de métrica** do dashboard de gestão — número grande + rótulo + dica
 * opcional. Compõe o `Card` do design system (sem cor hardcoded; dark + light).
 */
export function StatCard({
  titulo,
  valor,
  dica,
  icone: Icone,
}: {
  titulo: string
  valor: string | number
  dica?: string
  icone?: LucideIcon
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {titulo}
        </CardTitle>
        {Icone ? <Icone className="size-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{valor}</div>
        {dica ? (
          <p className="mt-1 text-xs text-muted-foreground">{dica}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/** Grade responsiva de `StatCard`s (1→2→4 colunas). */
export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}
