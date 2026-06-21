import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProgressBar } from "@/components/ProgressBar"
import { formatarMoeda, type GrupoCategoria } from "@/lib/calculations"

/** Uma faixa da regra 50‑30‑20 (Fixa / Variável / Investimento). */
export interface FaixaResumo {
  /** Rótulo exibido (ex.: "Despesa Fixa"). */
  rotulo: string
  /** Grupo correspondente (define se "mais é melhor"). */
  grupo: Extract<GrupoCategoria, "fixa" | "variavel" | "investimento">
  /** Meta da regra em pontos percentuais (50, 30 ou 20). */
  metaPct: number
  /** Valor ideal em R$ (metaPct% da renda base). */
  ideal: number
  /** Realizado do grupo em R$. */
  realizado: number
  /** Realizado como % da renda base. */
  percentualRenda: number
}

export interface Resumo503020Props {
  /** Renda base sobre a qual os ideais foram calculados. */
  rendaBase: number
  /** As três faixas (fixa 50%, variável 30%, investimento 20%). */
  faixas: ReadonlyArray<FaixaResumo>
}

/** Investimento é melhor acima da meta; despesas, abaixo (ou igual) dela. */
function variantFaixa(
  grupo: FaixaResumo["grupo"],
  percentualRenda: number,
  metaPct: number
): "success" | "warning" {
  const dentroDaMeta =
    grupo === "investimento"
      ? percentualRenda >= metaPct
      : percentualRenda <= metaPct
  return dentroDaMeta ? "success" : "warning"
}

/**
 * Resumo **50‑30‑20**: compara o realizado de cada grupo contra 50% / 30% / 20%
 * da renda base (planejada). Mostra ideal, realizado, % da renda e uma barra de
 * progresso rumo à meta. Presentational — valores chegam prontos de
 * `lib/calculations.ts`. Tokens do design system → dark + light.
 */
export function Resumo503020({ rendaBase, faixas }: Resumo503020Props) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">Resumo 50‑30‑20</CardTitle>
        <CardDescription>
          Distribuição ideal sobre a renda base de {formatarMoeda(rendaBase)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {faixas.map((faixa) => {
          const progresso =
            faixa.metaPct > 0
              ? Math.min(100, (faixa.percentualRenda / faixa.metaPct) * 100)
              : 0
          return (
            <div key={faixa.grupo} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">
                  {faixa.rotulo}{" "}
                  <span className="text-muted-foreground">
                    · meta {faixa.metaPct}%
                  </span>
                </span>
                <span className="font-mono text-sm tabular-nums">
                  {faixa.percentualRenda.toFixed(0)}%
                </span>
              </div>
              <ProgressBar
                value={progresso}
                size="sm"
                variant={variantFaixa(
                  faixa.grupo,
                  faixa.percentualRenda,
                  faixa.metaPct
                )}
                aria-label={`${faixa.rotulo}: ${faixa.percentualRenda.toFixed(
                  0
                )}% da renda, meta ${faixa.metaPct}%`}
              />
              <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-mono tabular-nums">
                  {formatarMoeda(faixa.realizado)}
                </span>
                <span className="font-mono tabular-nums">
                  ideal {formatarMoeda(faixa.ideal)}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
