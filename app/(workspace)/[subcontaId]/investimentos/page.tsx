import { Landmark, PiggyBank, Wallet } from "lucide-react"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProgressBar } from "@/components/ProgressBar"
import { CarteiraDistribuicaoChart } from "@/components/investimentos/CarteiraDistribuicaoChart"
import { ModoAvancado } from "@/components/investimentos/ModoAvancado"
import { PatrimonioModal } from "@/components/investimentos/PatrimonioModal"
import { PatrimonioRowActions } from "@/components/investimentos/PatrimonioRowActions"
import { DividaModal } from "@/components/investimentos/DividaModal"
import { DividaRowActions } from "@/components/investimentos/DividaRowActions"
import {
  CATEGORIAS_INVESTIMENTO,
  CATEGORIA_INVESTIMENTO_COR,
  CATEGORIA_INVESTIMENTO_LABEL,
  FINALIDADE_LABEL,
  TIPO_PATRIMONIO_LABEL,
  type CategoriaInvestimento,
  type FinalidadePatrimonio,
  type TipoPatrimonio,
} from "@/components/investimentos/labels"
import {
  agregarTotalAplicadoPorChave,
  calcularPatrimonioLiquido,
  calcularPercentual,
  calcularStatusReserva,
  calcularTotalAplicado,
  formatarMoeda,
} from "@/lib/calculations"
import { CustoEssencialCard } from "@/components/investimentos/CustoEssencialCard"
import { cn } from "@/lib/utils"

/**
 * Investimentos / Patrimônio (Spec 09) — visão de **carteira** (secundária,
 * discreta por padrão via "modo avançado"). Mostra os derivados na visão mínima
 * (**Patrimônio Líquido** + **Reserva de emergência** meta 6×) e, no modo
 * avançado, a distribuição por categoria, o resumo Reserva vs Patrimônio e o
 * CRUD de ativos e dívidas.
 *
 * Server Component: só busca dados (RLS-enforced) e calcula via
 * `lib/calculations.ts` — nenhum cálculo inline.
 */

interface PatrimonioRow {
  id: string
  tipo: TipoPatrimonio
  descricao: string | null
  valor: number
  rentabilidade: number
  categoria_investimento: CategoriaInvestimento | null
  finalidade: FinalidadePatrimonio | null
}

interface DividaRow {
  id: string
  tipo: string
  valor_total: number
}

export default async function InvestimentosPage({
  params,
}: {
  params: Promise<{ subcontaId: string }>
}) {
  const { subcontaId } = await params
  const supabase = await createSupabaseServerClient()

  // Três queries (sem N+1). RLS já escopa pela subconta.
  const [{ data: patrimonioData }, { data: dividasData }, { data: subcontaData }] =
    await Promise.all([
      supabase
        .from("patrimonio")
        .select(
          "id, tipo, descricao, valor, rentabilidade, categoria_investimento, finalidade"
        )
        .eq("subconta_id", subcontaId),
      supabase
        .from("dividas")
        .select("id, tipo, valor_total")
        .eq("subconta_id", subcontaId),
      // Custo de vida essencial → base da meta de reserva (6×), informado à mão.
      supabase
        .from("subcontas")
        .select("custo_vida_essencial")
        .eq("id", subcontaId)
        .maybeSingle(),
    ])

  const ativos = (patrimonioData ?? []) as unknown as PatrimonioRow[]
  const dividas = (dividasData ?? []) as unknown as DividaRow[]
  const custoEssencial =
    subcontaData?.custo_vida_essencial === null ||
    subcontaData?.custo_vida_essencial === undefined
      ? null
      : Number(subcontaData.custo_vida_essencial)

  // ─── Derivados (tudo via lib/calculations.ts) ──────────────────────────────
  const totalPatrimonio = ativos.reduce((s, a) => s + Number(a.valor), 0)
  const totalDividas = dividas.reduce((s, d) => s + Number(d.valor_total), 0)
  const patrimonioLiquido = calcularPatrimonioLiquido(totalPatrimonio, totalDividas)

  // Total aplicado por finalidade (reserva × patrimônio).
  const porFinalidade = agregarTotalAplicadoPorChave(
    ativos.map((a) => ({
      chave: a.finalidade,
      valor: Number(a.valor),
      rentabilidade: Number(a.rentabilidade),
    }))
  )
  const totalReserva = porFinalidade.get("reserva") ?? 0
  const totalPatrimonioFinalidade = porFinalidade.get("patrimonio") ?? 0
  // Meta = 6× o custo de vida essencial informado (Spec 26). Vazio → meta 0.
  const baseMeta = custoEssencial ?? 0
  const reserva = calcularStatusReserva(totalReserva, baseMeta)

  // Distribuição por categoria de investimento.
  const porCategoria = agregarTotalAplicadoPorChave(
    ativos.map((a) => ({
      chave: a.categoria_investimento,
      valor: Number(a.valor),
      rentabilidade: Number(a.rentabilidade),
    }))
  )
  const totalCarteira = CATEGORIAS_INVESTIMENTO.reduce(
    (s, c) => s + (porCategoria.get(c) ?? 0),
    0
  )
  const fatias = CATEGORIAS_INVESTIMENTO.map((c) => ({
    key: c,
    name: CATEGORIA_INVESTIMENTO_LABEL[c],
    value: porCategoria.get(c) ?? 0,
    color: CATEGORIA_INVESTIMENTO_COR[c],
  })).filter((f) => f.value > 0)

  const reservaPct = Math.min(Math.max(reserva.progresso * 100, 0), 100)
  const reservaAtingida = reserva.meta > 0 && reserva.atual >= reserva.meta

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Investimentos</h1>
        <p className="text-sm text-muted-foreground">
          Sua carteira e patrimônio: patrimônio líquido, reserva de emergência e
          distribuição dos ativos.
        </p>
      </div>

      {/* Visão mínima: derivados (PL + Reserva) — sempre visível */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardDescription className="flex items-center gap-1.5">
              <Landmark className="size-4" aria-hidden />
              Patrimônio Líquido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <p
              className={cn(
                "font-mono text-2xl font-semibold tabular-nums",
                patrimonioLiquido >= 0 ? "text-foreground" : "text-destructive"
              )}
            >
              {formatarMoeda(patrimonioLiquido)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatarMoeda(totalPatrimonio)} em bens −{" "}
              {formatarMoeda(totalDividas)} em dívidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardDescription className="flex items-center gap-1.5">
              <PiggyBank className="size-4" aria-hidden />
              Reserva de emergência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                {formatarMoeda(reserva.atual)}
              </span>
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                meta {formatarMoeda(reserva.meta)}
              </span>
            </div>
            <ProgressBar
              value={reservaPct}
              variant={reservaAtingida ? "success" : "warning"}
              aria-label="Progresso da reserva de emergência"
            />
            <p className="text-xs text-muted-foreground">
              {reserva.meta > 0
                ? `${reservaPct.toFixed(0)}% da meta (6× o custo essencial de ${formatarMoeda(baseMeta)})`
                : "Informe seu custo de vida essencial para calcular a meta (6×)."}
            </p>
            <CustoEssencialCard subcontaId={subcontaId} custoAtual={custoEssencial} />
          </CardContent>
        </Card>
      </div>

      {/* Modo avançado: carteira completa, distribuição, resumo e CRUD */}
      <ModoAvancado>
        {/* Distribuição + resumo Reserva vs Patrimônio */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição por categoria</CardTitle>
              <CardDescription>
                Total aplicado (valor + rentabilidade) por categoria de investimento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fatias.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum investimento classificado por categoria ainda.
                </p>
              ) : (
                <div className="space-y-4">
                  <CarteiraDistribuicaoChart fatias={fatias} />
                  <div className="space-y-1.5">
                    {fatias.map((f) => (
                      <div
                        key={f.key}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: f.color }}
                            aria-hidden
                          />
                          {f.name}
                        </span>
                        <span className="font-mono tabular-nums text-muted-foreground">
                          {formatarMoeda(f.value)} ·{" "}
                          {calcularPercentual(f.value, totalCarteira).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reserva vs Patrimônio</CardTitle>
              <CardDescription>
                Total aplicado por finalidade dos ativos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResumoFinalidade
                rotulo={FINALIDADE_LABEL.reserva}
                valor={totalReserva}
              />
              <ResumoFinalidade
                rotulo={FINALIDADE_LABEL.patrimonio}
                valor={totalPatrimonioFinalidade}
              />
            </CardContent>
          </Card>
        </div>

        {/* Carteira / patrimônio — CRUD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">Carteira</CardTitle>
              <CardDescription>Ativos: bens e investimentos.</CardDescription>
            </div>
            <PatrimonioModal subcontaId={subcontaId} />
          </CardHeader>
          <CardContent>
            {ativos.length === 0 ? (
              <EstadoVazio
                icone={<Wallet className="size-8 text-muted-foreground" aria-hidden />}
                titulo="Nenhum ativo ainda"
                descricao="Adicione um ativo (ex.: Tesouro Selic, imóvel) para montar sua carteira."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Finalidade</TableHead>
                    <TableHead className="text-right">Total aplicado</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ativos.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.descricao ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {TIPO_PATRIMONIO_LABEL[a.tipo]}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.categoria_investimento
                          ? CATEGORIA_INVESTIMENTO_LABEL[a.categoria_investimento]
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.finalidade ? FINALIDADE_LABEL[a.finalidade] : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatarMoeda(
                          calcularTotalAplicado(
                            Number(a.valor),
                            Number(a.rentabilidade)
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        <PatrimonioRowActions
                          subcontaId={subcontaId}
                          ativo={{
                            id: a.id,
                            tipo: a.tipo,
                            descricao: a.descricao ?? "",
                            valor: Number(a.valor),
                            rentabilidade: Number(a.rentabilidade),
                            categoriaInvestimento: a.categoria_investimento,
                            finalidade: a.finalidade,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dívidas — CRUD (entram no PL) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">Dívidas</CardTitle>
              <CardDescription>
                Reduzem o patrimônio líquido (Σ patrimônio − Σ dívidas).
              </CardDescription>
            </div>
            <DividaModal subcontaId={subcontaId} />
          </CardHeader>
          <CardContent>
            {dividas.length === 0 ? (
              <EstadoVazio
                icone={
                  <Landmark className="size-8 text-muted-foreground" aria-hidden />
                }
                titulo="Nenhuma dívida"
                descricao="Sem dívidas registradas — o patrimônio líquido é igual ao total de bens."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor total</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividas.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.tipo}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-destructive">
                        {formatarMoeda(Number(d.valor_total))}
                      </TableCell>
                      <TableCell>
                        <DividaRowActions
                          subcontaId={subcontaId}
                          divida={{
                            id: d.id,
                            tipo: d.tipo,
                            valorTotal: Number(d.valor_total),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </ModoAvancado>
    </div>
  )
}

/** Linha do resumo por finalidade (Reserva / Patrimônio). */
function ResumoFinalidade({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{rotulo}</span>
      <span className="font-mono text-lg font-semibold tabular-nums">
        {formatarMoeda(valor)}
      </span>
    </div>
  )
}

/** Estado vazio reutilizado nas tabelas (carteira / dívidas). */
function EstadoVazio({
  icone,
  titulo,
  descricao,
}: {
  icone: React.ReactNode
  titulo: string
  descricao: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icone}
      <p className="font-medium text-foreground">{titulo}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{descricao}</p>
    </div>
  )
}
