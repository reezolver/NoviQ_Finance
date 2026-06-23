import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton, TabelaSkeleton } from "@/components/skeletons"

/**
 * Skeleton do `/painel` enquanto a carteira de clientes carrega. A moldura
 * (sidebar + topbar) vive no layout e permanece montada — aqui só o conteúdo
 * (`max-w-5xl`): cabeçalho + ações + tabela (~5 linhas).
 */
export default function Loading() {
  return (
    <main className="flex-1" aria-busy="true" aria-label="Carregando…">
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
  )
}
