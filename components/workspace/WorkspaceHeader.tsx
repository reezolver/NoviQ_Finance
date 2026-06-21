import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Database } from '@/types/database'

type TipoSubconta = Database['public']['Enums']['tipo_subconta']

/**
 * Header mínimo do workspace: marca + nome da subconta ativa + toggle de tema.
 *
 * O **seletor de subconta** completo (lista de clientes, troca "estilo
 * Instagram") chega no Spec 07 — aqui só exibimos a subconta atual. O link da
 * marca aponta para `/`, onde o middleware redireciona conforme o papel
 * (cliente → própria subconta; gestor → `/painel`).
 */
export function WorkspaceHeader({
  nome,
  tipo,
}: {
  nome: string
  tipo: TipoSubconta
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
        <span className="truncate font-medium text-foreground">{nome}</span>
        <Badge variant="secondary" className="capitalize">
          {tipo}
        </Badge>
      </div>
      <ThemeToggle />
    </header>
  )
}
