import { Skeleton } from "@/components/ui/skeleton"
import { GraficoSkeleton, HeaderSkeleton } from "@/components/skeletons"

/**
 * Espelha `renda-futura/page.tsx`: cabeçalho + card de calculadora + gráfico de
 * projeção. (A calculadora é client-side; este skeleton cobre a montagem.)
 */
export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8"
      aria-busy="true"
      aria-label="Carregando…"
    >
      <HeaderSkeleton withAction={false} />
      <Skeleton className="h-56 w-full rounded-xl" aria-hidden />
      <GraficoSkeleton />
    </div>
  )
}
