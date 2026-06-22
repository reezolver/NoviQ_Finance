import { Target } from "lucide-react"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ObjetivoModal } from "@/components/objetivos/ObjetivoModal"
import {
  ObjetivoCard,
  type ObjetivoCardData,
} from "@/components/objetivos/ObjetivoCard"
import {
  calcularMesesRestantes,
  calcularNecessarioMensal,
  calcularProgressoObjetivo,
  calcularStatusObjetivo,
} from "@/lib/calculations"

/**
 * Objetivos — metas financeiras (Spec 06). Para cada objetivo da subconta:
 * valor alvo, data limite, **acumulado** (derivado), **necessário/mês**,
 * **progresso %** e **status** (no prazo / atrasado).
 *
 * Server Component: só busca dados (RLS-enforced) e calcula via
 * `lib/calculations.ts` — nenhum cálculo inline. O acumulado (MVP) é
 * `valor_inicial + Σ lançamentos do tipo objetivo vinculados a cada meta`.
 */

interface ObjetivoRow {
  id: string
  nome: string
  valor_alvo: number
  data_limite: string
  valor_inicial: number
}

interface LancamentoObjetivoRow {
  objetivo_id: string | null
  valor: number
}

export default async function ObjetivosPage({
  params,
}: {
  params: Promise<{ subcontaId: string }>
}) {
  const { subcontaId } = await params
  const supabase = await createSupabaseServerClient()

  // Duas queries (sem N+1). RLS já escopa pela subconta.
  const [{ data: objetivosData }, { data: lancamentosData }] = await Promise.all([
    supabase
      .from("objetivos")
      .select("id, nome, valor_alvo, data_limite, valor_inicial")
      .eq("subconta_id", subcontaId)
      .order("created_at"),
    supabase
      .from("lancamentos")
      .select("objetivo_id, valor")
      .eq("subconta_id", subcontaId)
      .eq("tipo", "objetivo"),
  ])

  const objetivos = (objetivosData ?? []) as unknown as ObjetivoRow[]
  const lancamentos = (lancamentosData ?? []) as unknown as LancamentoObjetivoRow[]

  // Σ lançamentos do tipo objetivo, agrupados por objetivo_id.
  const aportadoPorObjetivo = new Map<string, number>()
  for (const l of lancamentos) {
    if (!l.objetivo_id) continue
    aportadoPorObjetivo.set(
      l.objetivo_id,
      (aportadoPorObjetivo.get(l.objetivo_id) ?? 0) + Number(l.valor)
    )
  }

  const cards: ObjetivoCardData[] = objetivos.map((o) => {
    const valorAlvo = Number(o.valor_alvo)
    const valorInicial = Number(o.valor_inicial)
    const valorAcumulado = valorInicial + (aportadoPorObjetivo.get(o.id) ?? 0)
    const mesesRestantes = calcularMesesRestantes(o.data_limite)

    return {
      id: o.id,
      nome: o.nome,
      valorAlvo,
      dataLimite: o.data_limite,
      valorInicial,
      valorAcumulado,
      progresso: calcularProgressoObjetivo(valorAcumulado, valorAlvo),
      necessarioMensal: calcularNecessarioMensal(
        valorAlvo,
        valorAcumulado,
        mesesRestantes
      ),
      mesesRestantes,
      status: calcularStatusObjetivo(valorAcumulado, valorAlvo, o.data_limite),
    }
  })

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      {/* Cabeçalho + ação */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Objetivos</h1>
          <p className="text-sm text-muted-foreground">
            Suas metas financeiras: valor alvo, acumulado, necessário por mês e progresso.
          </p>
        </div>
        <ObjetivoModal subcontaId={subcontaId} />
      </div>

      {/* Grade de objetivos ou estado vazio */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Target className="size-8 text-muted-foreground" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Nenhum objetivo ainda</p>
            <p className="text-sm text-muted-foreground">
              Crie sua primeira meta (ex.: Casamento, R$ 50.000) e acompanhe o progresso.
            </p>
          </div>
          <ObjetivoModal subcontaId={subcontaId} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((objetivo) => (
            <ObjetivoCard
              key={objetivo.id}
              subcontaId={subcontaId}
              objetivo={objetivo}
            />
          ))}
        </div>
      )}
    </div>
  )
}
