import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Placeholder padrão das telas do workspace. O roteamento + escopo de subconta
 * (Spec 02) já estão prontos; o conteúdo real de cada tela chega no spec
 * indicado em `spec`. Usa só tokens do design system → válido em dark + light.
 */
export function TelaPlaceholder({
  titulo,
  descricao,
  spec,
}: {
  titulo: string
  descricao: string
  spec: string
}) {
  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">{titulo}</CardTitle>
            <Badge variant="outline">{spec}</Badge>
          </div>
          <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tela em construção — o roteamento e o escopo da subconta já estão
            ativos. O conteúdo desta tela será implementado no {spec}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
