import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function Precos() {
  return (
    <section id="precos" className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Planos chegando em breve
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            O Noviq está em <strong>fase beta</strong> e o uso é{' '}
            <strong>gratuito por enquanto</strong>. Quando os planos forem definidos, você será
            avisado com antecedência — e quem entrou no beta sai na frente.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div
            className="relative opacity-60 cursor-not-allowed select-none max-w-sm w-full"
            aria-disabled="true"
            aria-label="Plano em breve — ainda não disponível"
          >
            <div className="pointer-events-none">
              <Card>
                <CardHeader>
                  <Badge className="w-fit">Em breve</Badge>
                  <CardTitle className="text-xl mt-2">Plano Noviq</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tudo que você precisa para organizar suas finanças.
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic mb-4">Planos em definição</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>&#10003; Controle Anual e Mensal</li>
                    <li>&#10003; Lançamento rápido</li>
                    <li>&#10003; Objetivos e Investimentos</li>
                    <li>&#10003; Renda Futura</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="absolute inset-0 rounded-xl" aria-hidden="true" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">Enquanto está em beta, use de graça.</p>
          <Button asChild>
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
