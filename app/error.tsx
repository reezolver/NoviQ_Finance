"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/feedback/ErrorState"

/**
 * Boundary global das rotas. Mensagem amigável genérica + "Tentar novamente"
 * (`reset`) + retorno para `/` (o middleware re-roteia por papel). Não vaza
 * detalhe técnico ao usuário — só loga no console.
 */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      onReset={reset}
      secondaryHref="/"
      secondaryLabel="Ir para o início"
    />
  )
}
