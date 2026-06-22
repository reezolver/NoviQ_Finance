import {
  GraficoSkeleton,
  HeaderSkeleton,
  ResumoCardsSkeleton,
} from "@/components/skeletons"

/**
 * Mostrado ao **entrar** numa carteira (enquanto o layout valida a subconta e a
 * 1ª seção carrega). O `WorkspaceHeader` + `WorkspaceNav` vivem no layout e
 * permanecem montados — aqui só o `<main>`. Skeleton genérico de página do
 * workspace (mesmo container das seções, para evitar layout shift — RNF-2).
 */
export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8"
      aria-busy="true"
      aria-label="Carregando…"
    >
      <HeaderSkeleton />
      <ResumoCardsSkeleton />
      <GraficoSkeleton />
    </div>
  )
}
