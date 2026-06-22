import { Skeleton } from "@/components/ui/skeleton"
import { GraficoSkeleton, HeaderSkeleton } from "@/components/skeletons"

/**
 * Espelha `investimentos/page.tsx`: cabeçalho + visão mínima (PL + Reserva, 2
 * cards) + distribuição/gráfico + tabelas (carteira/dívidas). O "modo avançado"
 * é client e fica colapsado por padrão; o skeleton cobre a visão mínima e o
 * primeiro bloco para dar feedback sem prever o estado do toggle.
 */
export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8"
      aria-busy="true"
      aria-label="Carregando…"
    >
      <HeaderSkeleton withAction={false} />
      {/* visão mínima: PL + reserva */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-xl" aria-hidden />
        <Skeleton className="h-32 rounded-xl" aria-hidden />
      </div>
      {/* distribuição (gráfico) + resumo */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GraficoSkeleton />
        <Skeleton className="h-72 w-full rounded-xl" aria-hidden />
      </div>
    </div>
  )
}
