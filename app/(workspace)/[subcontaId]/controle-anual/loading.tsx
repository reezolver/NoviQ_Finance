import { Skeleton } from "@/components/ui/skeleton"
import {
  GraficoSkeleton,
  HeaderSkeleton,
  ResumoCardsSkeleton,
} from "@/components/skeletons"

/**
 * Espelha `controle-anual/page.tsx`: cabeçalho + navegação de ano + 3 cards de
 * resumo + gráfico + grade dos 12 meses (`grid … xl:grid-cols-4`). Mesmas
 * larguras de grid do conteúdo real → sem layout shift (RNF-2).
 */
export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8"
      aria-busy="true"
      aria-label="Carregando…"
    >
      {/* cabeçalho (a "ação" aqui é a navegação de ano) */}
      <HeaderSkeleton />
      {/* 3 cards de resumo */}
      <ResumoCardsSkeleton />
      {/* gráfico em destaque */}
      <GraficoSkeleton />
      {/* grade dos 12 meses */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" aria-hidden />
        ))}
      </div>
    </div>
  )
}
