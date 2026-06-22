import { RendaFuturaCalculadora } from "@/components/renda-futura/RendaFuturaCalculadora"

/**
 * **Renda Futura** (Spec 10) — calculadora de aposentadoria / renda passiva por
 * juros compostos com **capitalização anual** (alinhada à planilha). É uma
 * calculadora client-side (não persiste no MVP); todo cálculo vive em
 * `lib/calculations.ts`.
 */
export default function RendaFuturaPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Renda Futura</h1>
        <p className="text-sm text-muted-foreground">
          Quanto seu dinheiro pode render até a aposentadoria e qual patrimônio
          você precisa para viver da renda passiva.
        </p>
      </div>

      <RendaFuturaCalculadora />
    </div>
  )
}
