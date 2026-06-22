import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Shapes de skeleton reutilizáveis entre os `loading.tsx` do App Router.
 * Reaproveitam os padrões já demonstrados no styleguide
 * (`app/styleguide/components/skeleton/page.tsx`) — nada criado do zero, só o
 * primitivo `Skeleton` (`bg-muted`, dark+light) com `className`.
 *
 * Todos os shapes são decorativos → `aria-hidden`. Quem usa deve envolver a
 * região em `<div aria-busy aria-label="Carregando…">` (RNF-1).
 */

/** Cabeçalho de página: título + subtítulo + ação opcional à direita. */
export function HeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" aria-hidden />
        <Skeleton className="h-4 w-72 max-w-full" aria-hidden />
      </div>
      {withAction ? <Skeleton className="h-9 w-32 rounded-md" aria-hidden /> : null}
    </div>
  )
}

/** Grade de cards de resumo (KPIs). Espelha `grid sm:grid-cols-3`. */
export function ResumoCardsSkeleton({
  count = 3,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" aria-hidden />
      ))}
    </div>
  )
}

/** Bloco de gráfico em destaque. */
export function GraficoSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-72 w-full rounded-xl", className)} aria-hidden />
}

/** Card genérico (padrão "Card" do styleguide). */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 rounded-xl border bg-card p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" aria-hidden />
          <Skeleton className="h-4 w-48 max-w-full" aria-hidden />
        </div>
        <Skeleton className="size-8 rounded-md" aria-hidden />
      </div>
      <Skeleton className="h-px w-full" aria-hidden />
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-28" aria-hidden />
          <Skeleton className="h-3.5 w-10" aria-hidden />
        </div>
        <Skeleton className="h-2 w-full rounded-full" aria-hidden />
      </div>
    </div>
  )
}

/** Tabela: faixa de cabeçalho + N linhas (padrão "Table Rows" do styleguide). */
export function TabelaSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="border-b bg-muted/50 px-4 py-2.5">
        <Skeleton className="h-4 w-32" aria-hidden />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-7 shrink-0 rounded-md" aria-hidden />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40 max-w-full" aria-hidden />
              <Skeleton className="h-3 w-24" aria-hidden />
            </div>
            <Skeleton className="ml-auto h-4 w-20" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  )
}
