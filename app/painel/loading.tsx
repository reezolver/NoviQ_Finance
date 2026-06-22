import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton, TabelaSkeleton } from "@/components/skeletons"

/**
 * Skeleton do `/painel` enquanto a carteira de clientes carrega. O painel tem
 * header próprio (`max-w-5xl`, não usa o layout do workspace), então o skeleton
 * replica a barra de topo + cabeçalho + ações + tabela (~5 linhas).
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      aria-busy="true"
      aria-label="Carregando…"
    >
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <span className="text-xl font-bold text-primary">Noviq</span>
        <Skeleton className="size-9 rounded-md" aria-hidden />
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
          <HeaderSkeleton />
          {/* barra de ações */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-36 rounded-md" aria-hidden />
            <Skeleton className="h-9 w-36 rounded-md" aria-hidden />
            <Skeleton className="h-9 w-32 rounded-md" aria-hidden />
          </div>
          {/* tabela de clientes */}
          <TabelaSkeleton rows={5} />
        </div>
      </main>
    </div>
  )
}
