import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MockMensal } from '@/components/landing/mocks/MockMensal'

function MolduraBrowser({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border shadow-2xl overflow-hidden bg-card">
      <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-border">
        <div className="w-3 h-3 rounded-full bg-destructive/50" />
        <div className="w-3 h-3 rounded-full bg-warning/50" />
        <div className="w-3 h-3 rounded-full bg-success/50" />
        <span className="ml-3 text-[11px] text-muted-foreground truncate">noviqfinance.com.br/mensal</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit">Beta · uso gratuito por enquanto</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            A clareza da planilha. A praticidade de um app.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
            Organize sua vida financeira com o método que funciona de verdade: o que você{' '}
            <strong>planejou</strong>, o que você <strong>realizou</strong> e a{' '}
            <strong>diferença</strong> entre os dois — em poucas telas, sem complicação.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild>
              <Link href="/cadastro">Criar conta grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Sem cartão de crédito. Leva menos de 1 minuto.
          </p>
        </div>

        <div className="relative">
          <MolduraBrowser>
            <MockMensal />
          </MolduraBrowser>
        </div>
      </div>
    </section>
  )
}
