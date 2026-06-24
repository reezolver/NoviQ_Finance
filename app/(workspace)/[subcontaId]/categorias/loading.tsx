import { CardSkeleton, HeaderSkeleton } from "@/components/skeletons"

/**
 * Espelha `categorias/page.tsx`: cabeçalho + um bloco (Card) por grupo de
 * categoria. Usa o shape de Card do styleguide.
 */
export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8"
      aria-busy="true"
      aria-label="Carregando…"
    >
      <HeaderSkeleton />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
