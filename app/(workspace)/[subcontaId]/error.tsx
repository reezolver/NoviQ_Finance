"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/feedback/ErrorState"

/**
 * Erro dentro de uma carteira. Renderiza **dentro** do layout do workspace, então
 * header/nav permanecem. Ação "Tentar novamente" (`reset`) + "Voltar ao painel".
 *
 * Este boundary **não** captura o `notFound()` lançado pelo layout — isso é 404,
 * tratado em `not-found.tsx`.
 */
export default function WorkspaceError({
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
      secondaryHref="/painel"
      secondaryLabel="Voltar ao painel"
    />
  )
}
