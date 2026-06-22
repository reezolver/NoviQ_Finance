import Link from "next/link"
import { Compass } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * 404 global (rota inexistente). Mensagem clara + retorno para `/` (o middleware
 * re-roteia por papel). Só tokens do design system (dark+light).
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Compass className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O endereço que você tentou abrir não existe ou foi movido.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Ir para o início</Link>
      </Button>
    </div>
  )
}
