import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { TelaPlaceholder } from '@/components/workspace/TelaPlaceholder'

/**
 * Painel de gestão — porta de entrada de educador/master (lista de clientes +
 * seletor de subconta + onboarding). Conteúdo real no Spec 07. Aqui só o
 * placeholder com header mínimo (marca + toggle de tema) para validar o
 * roteamento por papel.
 */
export default function PainelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <Link href="/" className="text-xl font-bold text-primary" aria-label="Início">
          Noviq
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex-1">
        <TelaPlaceholder
          titulo="Painel de gestão"
          descricao="Lista de clientes da carteira, seletor de subconta e onboarding. Master vê clientes de qualquer educador."
          spec="Spec 07"
        />
      </main>
    </div>
  )
}
