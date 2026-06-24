import Link from 'next/link'
import { User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ParaQuem() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Feito para você — e para quem cuida das suas finanças
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardContent className="flex flex-col gap-5 p-0">
              <User className="size-10 text-primary" />
              <div>
                <h3 className="text-xl font-semibold">Quer organizar a própria vida financeira.</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Você cansou de planilha manual e de app confuso. Quer clareza em poucas telas,
                  no seu tempo. O Noviq é a ferramenta — simples por fora, completa por dentro.
                </p>
              </div>
              <Button asChild className="w-fit">
                <Link href="/cadastro">Criar conta grátis</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="flex flex-col gap-5 p-0">
              <Users className="size-10 text-primary" />
              <div>
                <h3 className="text-xl font-semibold">Você acompanha clientes.</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Centralize sua carteira, faça a anamnese antes da reunião e lance pelo cliente
                  quando ele não tiver tempo. Menos planilha, mais consultoria.
                </p>
              </div>
              <Button variant="outline" asChild className="w-fit">
                <Link href="/cadastro">Começar como educador</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
