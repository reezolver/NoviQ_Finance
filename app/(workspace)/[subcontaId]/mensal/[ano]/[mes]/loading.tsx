import { Skeleton } from "@/components/ui/skeleton"
import {
  GraficoSkeleton,
  HeaderSkeleton,
  ResumoCardsSkeleton,
} from "@/components/skeletons"

/**
 * Espelha `mensal/[ano]/[mes]/page.tsx`: cabeçalho + ações, navegação de meses,
 * saldo (3 cards), gráfico, 3 blocos de grupo (tabelas) e o par resumo
 * 50‑30‑20 + detalhamento. Mesmas grids → sem layout shift (RNF-2).
 */
export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8"
      aria-busy="true"
      aria-label="Carregando…"
    >
      {/* cabeçalho + ações */}
      <HeaderSkeleton />
      {/* navegação por meses */}
      <Skeleton className="h-10 w-full rounded-md" aria-hidden />
      {/* saldo do mês (3 cards) */}
      <ResumoCardsSkeleton />
      {/* gráfico em destaque */}
      <GraficoSkeleton />
      {/* 3 blocos de grupo (renda, fixa, variável) */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" aria-hidden />
        ))}
      </div>
      {/* resumo 50‑30‑20 + detalhamento por categoria */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" aria-hidden />
        <Skeleton className="h-64 w-full rounded-xl" aria-hidden />
      </div>
    </div>
  )
}
