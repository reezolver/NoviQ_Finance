import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CtaFinal() {
  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 text-center flex flex-col gap-6 items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Comece a ter controle hoje
        </h2>
        <p className="text-lg text-white/80 max-w-xl">
          Crie sua conta gratuita e veja, na primeira tela, pra onde seu dinheiro está indo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-white border border-white/30 hover:bg-white/10"
            asChild
          >
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
