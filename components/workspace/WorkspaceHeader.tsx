import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import {
  SeletorSubconta,
  type SubcontaAcessivel,
} from "@/components/workspace/SeletorSubconta"

/**
 * Header do workspace: marca + **seletor de subconta** ("trocar de conta estilo
 * Instagram") + toggle de tema. O seletor lista as subcontas acessíveis (já
 * filtradas pela RLS) e troca apenas o contexto de workspace — não a sessão.
 *
 * O link da marca aponta para `/`, onde o middleware redireciona conforme o
 * papel (cliente → própria subconta; gestor → `/painel`).
 */
export function WorkspaceHeader({
  subcontas,
  subcontaAtivaId,
}: {
  subcontas: SubcontaAcessivel[]
  subcontaAtivaId: string
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <Link
          href="/"
          className="text-xl font-bold text-primary"
          aria-label="Início"
        >
          Noviq
        </Link>
        <span className="text-muted-foreground" aria-hidden>
          /
        </span>
        <SeletorSubconta
          subcontas={subcontas}
          subcontaAtivaId={subcontaAtivaId}
        />
      </div>
      <ThemeToggle />
    </header>
  )
}
