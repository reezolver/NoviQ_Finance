"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/feedback/ErrorState"

/**
 * Erro ao carregar a carteira no `/painel`. "Tentar novamente" (`reset`) e
 * permanece no painel (sem link secundário — já estamos na raiz do gestor).
 */
export default function PainelError({
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
      description="Não foi possível carregar a carteira. Tente novamente."
      onReset={reset}
    />
  )
}
