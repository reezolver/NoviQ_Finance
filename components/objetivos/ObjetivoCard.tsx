import { CalendarDays, Target, TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ProgressBar"
import { ObjetivoCardActions } from "@/components/objetivos/ObjetivoCardActions"
import type { ObjetivoExistente } from "@/components/objetivos/ObjetivoModal"
import { formatarMoeda } from "@/lib/calculations"
import type { StatusObjetivo } from "@/types/financeiro"

/** Dados já calculados para o card (cálculos vivem em `lib/calculations.ts`). */
export interface ObjetivoCardData extends ObjetivoExistente {
  /** Valor acumulado = valor_inicial + Σ lançamentos do tipo objetivo. */
  valorAcumulado: number
  /** Progresso em % (0–100, pode passar de 100 visualmente limitado). */
  progresso: number
  /** Valor necessário por mês para atingir a meta no prazo. */
  necessarioMensal: number
  /** Meses restantes até a data limite (0 se vencido). */
  mesesRestantes: number
  /** Status quanto ao prazo. */
  status: StatusObjetivo
}

/** Formata `AAAA-MM-DD` como data brasileira sem depender de fuso. */
function formatarDataLimite(data: string): string {
  const [ano, mes, dia] = data.split("-")
  if (!ano || !mes || !dia) return data
  return `${dia}/${mes}/${ano}`
}

const STATUS_LABEL: Record<StatusObjetivo, string> = {
  no_prazo: "No prazo",
  atrasado: "Atrasado",
}

/**
 * Card de objetivo (Spec 06): nome, valor alvo, data limite, acumulado,
 * necessário/mês, progresso % e status (no prazo / atrasado). Apenas
 * apresentação — recebe valores já calculados do Server Component da page.
 */
export function ObjetivoCard({
  subcontaId,
  objetivo,
}: {
  subcontaId: string
  objetivo: ObjetivoCardData
}) {
  const concluido = objetivo.status === "no_prazo"
  const progressoLimitado = Math.min(Math.max(objetivo.progresso, 0), 100)
  const statusCor = concluido ? "text-success" : "text-destructive"

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{objetivo.nome}</span>
          </CardTitle>
          <Badge
            variant="outline"
            className={statusCor}
          >
            {STATUS_LABEL[objetivo.status]}
          </Badge>
        </div>
        <ObjetivoCardActions
          subcontaId={subcontaId}
          objetivo={{
            id: objetivo.id,
            nome: objetivo.nome,
            valorAlvo: objetivo.valorAlvo,
            dataLimite: objetivo.dataLimite,
            valorInicial: objetivo.valorInicial,
          }}
        />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Acumulado × alvo + barra de progresso */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {formatarMoeda(objetivo.valorAcumulado)}
            </span>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              de {formatarMoeda(objetivo.valorAlvo)}
            </span>
          </div>
          <ProgressBar
            value={progressoLimitado}
            variant={concluido ? "success" : "destructive"}
            aria-label={`Progresso do objetivo ${objetivo.nome}`}
          />
          <p className="text-right text-xs tabular-nums text-muted-foreground">
            {progressoLimitado.toFixed(0)}%
          </p>
        </div>

        {/* Métricas: data limite + necessário/mês */}
        <div className="mt-auto grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-0.5">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden />
              Data limite
            </p>
            <p className="font-medium tabular-nums">
              {formatarDataLimite(objetivo.dataLimite)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5" aria-hidden />
              Necessário/mês
            </p>
            <p className="font-mono font-medium tabular-nums">
              {formatarMoeda(objetivo.necessarioMensal)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
