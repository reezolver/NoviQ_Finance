import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Tela de erro reutilizável pelos `error.tsx` do App Router. Apresentacional:
 * recebe `onReset` (vindo do `reset` do boundary) e um link de retorno
 * opcional. Centralizada, tom calmo, copy PT-BR, só tokens (dark+light).
 *
 * **Nunca** recebe nem exibe detalhe técnico do erro — o boundary loga no
 * console; aqui só mostramos a mensagem amigável.
 */
export function ErrorState({
  title = "Algo deu errado",
  description = "Não foi possível carregar esta tela. Tente novamente.",
  onReset,
  secondaryHref,
  secondaryLabel,
}: {
  title?: string
  description?: string
  onReset: () => void
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" aria-hidden />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onReset}>
          <RefreshCw /> Tentar novamente
        </Button>
        {secondaryHref && secondaryLabel ? (
          <Button asChild variant="outline">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
