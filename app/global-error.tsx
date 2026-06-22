"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/feedback/ErrorState"
import "./globals.css"

/**
 * Boundary de **último recurso** — captura erros no próprio root layout. Como
 * substitui o root layout, **precisa renderizar `<html>`/`<body>` próprios** e
 * reimportar os estilos globais (tokens do design system). Sem `ThemeProvider`
 * aqui: caímos no tema claro padrão, ainda 100% nos tokens.
 */
export default function GlobalError({
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
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ErrorState
          description="Ocorreu um erro inesperado. Tente novamente."
          onReset={reset}
          secondaryHref="/"
          secondaryLabel="Ir para o início"
        />
      </body>
    </html>
  )
}
