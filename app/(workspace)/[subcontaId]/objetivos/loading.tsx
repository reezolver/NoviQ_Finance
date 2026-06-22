import { CardSkeleton, HeaderSkeleton } from "@/components/skeletons"

/**
 * Espelha `objetivos/page.tsx`: cabeçalho + grade de cards de objetivo
 * (`grid sm:grid-cols-2 lg:grid-cols-3`). Usa o shape de Card do styleguide.
 */
export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8"
      aria-busy="true"
      aria-label="Carregando…"
    >
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
