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
  /** Quanto o cliente planejou para o grupo, em R$ (Spec 33). */
  planejado: number
  /** Realizado do grupo em R$. */
  realizado: number
  /** Planejado como % da renda base — o "40/40/20" do próprio cliente. */
  percentualPlanejado: number
  /** Realizado como % da renda base. */
  percentualRenda: number
}

export interface Resumo503020Props {
  /** Renda base sobre a qual os ideais foram calculados. */
  rendaBase: number
  /** As três faixas (fixa 50%, variável 30%, investimento 20%). */
  faixas: ReadonlyArray<FaixaResumo>
}

/**
 * Cor da faixa. **A referência é o Planejado** (Spec 33 · R6 / PRD Q3): é o
 * compromisso que o cliente assumiu para o mês, e é contra ele que faz sentido
 * dizer "cumpriu ou não". O Ideal (50‑30‑20) continua na tela como régua
 * educativa, mas não decide a cor.
 *
 * Quando não há planejado para o grupo, cai no ideal — senão um mês sem
 * orçamento ficaria sempre verde por comparar contra zero.
 *
 * Investimento é melhor **acima** da referência; despesas, **abaixo** (ou igual).
 */
function variantFaixa(
  grupo: FaixaResumo["grupo"],
  percentualRenda: number,
  percentualPlanejado: number,
  metaPct: number
): "success" | "warning" {
  const referencia = percentualPlanejado > 0 ? percentualPlanejado : metaPct
  const dentroDaReferencia =
    grupo === "investimento"
      ? percentualRenda >= referencia
      : percentualRenda <= referencia
  return dentroDaReferencia ? "success" : "warning"
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
          // Escala comum aos três valores: o maior deles vira 100% da barra,
          // então planejado, ideal e realizado ficam comparáveis na mesma régua
          // sem estourar. Nunca zero → não há divisão por zero.
          const escala = Math.max(
            faixa.percentualRenda,
            faixa.percentualPlanejado,
            faixa.metaPct,
            1
          )
          const posicao = (pct: number) =>
            `${Math.min(100, (pct / escala) * 100)}%`

          return (
            <div key={faixa.grupo} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">
                  {faixa.rotulo}{" "}
                  <span className="text-muted-foreground">
                    · ideal {faixa.metaPct}%
                  </span>
                </span>
                <span className="font-mono text-sm tabular-nums">
                  {faixa.percentualRenda.toFixed(0)}%
                </span>
              </div>

              {/* Uma barra (realizado) com dois marcadores: planejado e ideal.
                  Três barras empilhadas viravam ruído — esta tela é vista pelo
                  cliente final, não só pelo educador (R7). */}
              <div className="relative">
                <ProgressBar
                  value={Math.min(100, (faixa.percentualRenda / escala) * 100)}
                  size="sm"
                  variant={variantFaixa(
                    faixa.grupo,
                    faixa.percentualRenda,
                    faixa.percentualPlanejado,
                    faixa.metaPct
                  )}
                  aria-label={`${faixa.rotulo}: realizado ${faixa.percentualRenda.toFixed(
                    0
                  )}% da renda, planejado ${faixa.percentualPlanejado.toFixed(
                    0
                  )}%, ideal ${faixa.metaPct}%`}
                />
                {faixa.percentualPlanejado > 0 ? (
                  <span
                    aria-hidden
                    title={`Planejado ${faixa.percentualPlanejado.toFixed(0)}%`}
                    className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                    style={{ left: posicao(faixa.percentualPlanejado) }}
                  />
                ) : null}
                <span
                  aria-hidden
                  title={`Ideal ${faixa.metaPct}%`}
                  className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/70"
                  style={{ left: posicao(faixa.metaPct) }}
                />
              </div>

              <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-mono tabular-nums">
                  {formatarMoeda(faixa.realizado)}
                </span>
                <span className="flex items-center gap-3 font-mono tabular-nums">
                  <span>planejado {formatarMoeda(faixa.planejado)}</span>
                  <span>ideal {formatarMoeda(faixa.ideal)}</span>
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
