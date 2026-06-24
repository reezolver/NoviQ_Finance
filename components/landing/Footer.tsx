import Link from 'next/link'

const LINKS = [
  { label: 'Entrar', href: '/login', interno: true },
  { label: 'Criar conta', href: '/cadastro', interno: true },
  { label: 'Funcionalidades', href: '#funcionalidades', interno: true },
  { label: 'Como funciona', href: '#como-funciona', interno: true },
  { label: 'Preços', href: '#precos', interno: true },
  { label: 'Perguntas', href: '#perguntas', interno: true },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex flex-col gap-3">
            {/* light mode */}
            <img
              src="/landing/logo-preta.svg"
              alt="Noviq Finance"
              height={28}
              className="h-7 block dark:hidden"
            />
            {/* dark mode */}
            <img
              src="/landing/logo-branca.svg"
              alt="Noviq Finance"
              height={28}
              className="h-7 hidden dark:block"
            />
            <p className="text-sm text-muted-foreground">
              Clareza financeira, do seu jeito.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((l) =>
              l.interno ? (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.label}
                </a>
              )
            )}
          </nav>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contato</p>
            <a
              href="mailto:contato@noviqfinance.com.br"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              contato@noviqfinance.com.br
            </a>
            <a
              href="https://wa.me/5521979521073"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              +55 21 97952-1073
            </a>
            <a
              href="https://www.instagram.com/noviqfinance/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              @noviqfinance
            </a>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © Noviq Finance · 2026. Em fase beta.
          </p>
        </div>
      </div>
    </footer>
  )
}
