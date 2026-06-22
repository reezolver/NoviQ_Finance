import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getUsuarioAtual } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  SeletorSubconta,
  type SubcontaAcessivel,
} from "@/components/workspace/SeletorSubconta"

/**
 * Header do workspace: marca + **seletor de subconta** ("trocar de conta estilo
 * Instagram") + atalho "Voltar ao painel" (só gestor) + toggle de tema. O
 * seletor lista as subcontas acessíveis (já filtradas pela RLS) e troca apenas o
 * contexto de workspace — não a sessão.
 *
 * O link da marca aponta para `/`, onde o middleware redireciona conforme o
 * papel (cliente → própria subconta; gestor → `/painel`).
 */
export async function WorkspaceHeader({
  subcontas,
  subcontaAtivaId,
}: {
  subcontas: SubcontaAcessivel[]
  subcontaAtivaId: string
}) {
  // "Voltar ao painel" só faz sentido para o gestor (cliente não tem painel).
  const usuario = await getUsuarioAtual()
  const isGestor =
    usuario?.tipo_perfil === "educador" || usuario?.tipo_perfil === "master"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {/* "Voltar ao painel" à esquerda (convenção de voltar) — só gestor. */}
        {isGestor ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/painel" aria-label="Voltar ao painel de gestão">
              <ArrowLeft />
              <span className="hidden sm:inline">Voltar ao painel</span>
            </Link>
          </Button>
        ) : null}
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
          isGestor={isGestor}
        />
      </div>
      <ThemeToggle />
    </header>
  )
}
