"use client"

import * as React from "react"
import { Target, TrendingUp, Wallet } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  calcularPatrimonioNecessario,
  calcularRendaFuturaAnual,
  formatarMoeda,
} from "@/lib/calculations"
import { cn } from "@/lib/utils"
import { ProjecaoChart, type PontoProjecao } from "./ProjecaoChart"

/** Inputs da calculadora (mantidos como string p/ permitir edição livre). */
interface Inputs {
  aporteInicial: string
  aporteMensal: string
  taxaAnual: string
  idadeAtual: string
  idadeAlvo: string
  rendaPassivaDesejada: string
}

const INICIAL: Inputs = {
  aporteInicial: "10000",
  aporteMensal: "1000",
  taxaAnual: "10",
  idadeAtual: "30",
  idadeAlvo: "60",
  rendaPassivaDesejada: "5000",
}

/** Converte string de input em número (vazio/ inválido → 0). */
function num(valor: string): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

/**
 * **Calculadora de Renda Futura** (Spec 10) — aposentadoria / renda passiva por
 * juros compostos com **capitalização anual** (alinhada à planilha). Form
 * client-side reativo: a cada mudança recalcula via `lib/calculations.ts`
 * (nenhum cálculo inline) e re-renderiza saídas, tabela e gráfico. Não persiste.
 */
export function RendaFuturaCalculadora() {
  const [inputs, setInputs] = React.useState<Inputs>(INICIAL)

  const set =
    (campo: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setInputs((prev) => ({ ...prev, [campo]: e.target.value }))

  const projecao = React.useMemo(
    () =>
      calcularRendaFuturaAnual(
        num(inputs.aporteInicial),
        num(inputs.aporteMensal),
        num(inputs.taxaAnual),
        num(inputs.idadeAtual),
        num(inputs.idadeAlvo)
      ),
    [inputs]
  )

  const patrimonioNecessario = React.useMemo(
    () =>
      calcularPatrimonioNecessario(
        num(inputs.rendaPassivaDesejada),
        num(inputs.taxaAnual)
      ),
    [inputs.rendaPassivaDesejada, inputs.taxaAnual]
  )

  // Decompõe a projeção em aportado × rendimento acumulados (base do gráfico).
  const pontos: PontoProjecao[] = React.useMemo(() => {
    const aporteInicial = num(inputs.aporteInicial)
    const aporteNoAno = num(inputs.aporteMensal) * 12
    return projecao.projecaoAnual.map((a, i) => {
      const aportado = aporteInicial + aporteNoAno * i
      return {
        idade: a.idade,
        aportado,
        rendimento: Math.max(0, a.patrimonioAcumulado - aportado),
      }
    })
  }, [projecao, inputs.aporteInicial, inputs.aporteMensal])

  const metaAtingida =
    patrimonioNecessario > 0 && projecao.patrimonioFinal >= patrimonioNecessario

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      {/* Coluna de inputs */}
      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-base">Seus dados</CardTitle>
          <CardDescription>
            Ajuste os valores — os resultados atualizam na hora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Campo
            id="aporte-inicial"
            label="Aporte inicial"
            prefixo="R$"
            value={inputs.aporteInicial}
            onChange={set("aporteInicial")}
          />
          <Campo
            id="aporte-mensal"
            label="Aporte mensal"
            prefixo="R$"
            value={inputs.aporteMensal}
            onChange={set("aporteMensal")}
          />
          <Campo
            id="taxa-anual"
            label="Taxa média (ao ano)"
            sufixo="%"
            value={inputs.taxaAnual}
            onChange={set("taxaAnual")}
            step="0.1"
          />
          <div className="grid grid-cols-2 gap-3">
            <Campo
              id="idade-atual"
              label="Idade atual"
              value={inputs.idadeAtual}
              onChange={set("idadeAtual")}
            />
            <Campo
              id="idade-alvo"
              label="Idade-alvo"
              value={inputs.idadeAlvo}
              onChange={set("idadeAlvo")}
            />
          </div>
          <Campo
            id="renda-passiva"
            label="Renda passiva desejada (mês)"
            prefixo="R$"
            value={inputs.rendaPassivaDesejada}
            onChange={set("rendaPassivaDesejada")}
          />
        </CardContent>
      </Card>

      {/* Coluna de resultados */}
      <div className="space-y-6">
        {/* Destaques: patrimônio necessário × patrimônio projetado */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-0">
              <CardDescription className="flex items-center gap-1.5">
                <Target className="size-4" aria-hidden />
                Patrimônio necessário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                {patrimonioNecessario > 0
                  ? formatarMoeda(patrimonioNecessario)
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {patrimonioNecessario > 0
                  ? `Para render ${formatarMoeda(num(inputs.rendaPassivaDesejada))}/mês (perpetuidade)`
                  : "Informe uma taxa maior que 0 para calcular."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <CardDescription className="flex items-center gap-1.5">
                <Wallet className="size-4" aria-hidden />
                Patrimônio projetado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p
                className={cn(
                  "font-mono text-2xl font-semibold tabular-nums",
                  metaAtingida ? "text-success" : "text-foreground"
                )}
              >
                {formatarMoeda(projecao.patrimonioFinal)}
              </p>
              <p className="text-xs text-muted-foreground">
                {patrimonioNecessario > 0
                  ? metaAtingida
                    ? "🎉 Você atinge o patrimônio necessário."
                    : `Faltam ${formatarMoeda(patrimonioNecessario - projecao.patrimonioFinal)} para a meta.`
                  : `Renda passiva estimada: ${formatarMoeda(projecao.rendaPassivaMensal)}/mês`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resumo: aportado × rendimento × renda passiva */}
        <Card>
          <CardContent className="grid gap-4 py-6 sm:grid-cols-3">
            <Resumo rotulo="Total aportado" valor={projecao.totalAportado} />
            <Resumo
              rotulo="Rendimento total"
              valor={projecao.rendimentoTotal}
              destaque="text-success"
            />
            <Resumo
              rotulo="Renda passiva (mês)"
              valor={projecao.rendaPassivaMensal}
            />
          </CardContent>
        </Card>

        {/* Gráfico da projeção */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="size-4 text-primary" aria-hidden />
                Projeção ano a ano
              </span>
            </CardTitle>
            <CardDescription>
              Patrimônio acumulado por idade — base aportada e rendimento (juros).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjecaoChart pontos={pontos} />
          </CardContent>
        </Card>

        {/* Tabela da projeção */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhamento</CardTitle>
            <CardDescription>
              Evolução do patrimônio a cada ano (capitalização anual).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[28rem] overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Idade</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead className="text-right">Aporte no ano</TableHead>
                    <TableHead className="text-right">Rendimento</TableHead>
                    <TableHead className="text-right">Patrimônio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projecao.projecaoAnual.map((a) => (
                    <TableRow key={a.idade}>
                      <TableCell className="font-medium">{a.idade}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.ano}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatarMoeda(a.aporteNoAno)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-success">
                        {formatarMoeda(a.rendimentoNoAno)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium tabular-nums">
                        {formatarMoeda(a.patrimonioAcumulado)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/** Campo numérico rotulado, com prefixo (R$) ou sufixo (%) opcional. */
function Campo({
  id,
  label,
  value,
  onChange,
  prefixo,
  sufixo,
  step,
}: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  prefixo?: string
  sufixo?: string
  step?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {prefixo && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefixo}
          </span>
        )}
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          value={value}
          onChange={onChange}
          className={cn(prefixo && "pl-9", sufixo && "pr-8")}
        />
        {sufixo && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {sufixo}
          </span>
        )}
      </div>
    </div>
  )
}

/** Bloco de resumo (rótulo + valor monetário) do painel de resultados. */
function Resumo({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string
  valor: number
  destaque?: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p
        className={cn(
          "font-mono text-lg font-semibold tabular-nums",
          destaque ?? "text-foreground"
        )}
      >
        {formatarMoeda(valor)}
      </p>
    </div>
  )
}
