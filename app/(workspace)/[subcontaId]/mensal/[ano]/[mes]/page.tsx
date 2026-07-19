import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { Receipt, ShoppingCart, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BlocoGrupo } from "@/components/mensal/BlocoGrupo"
import { corDiferenca, sinal } from "@/components/mensal/financeiro-ui"
import { NavegacaoMeses } from "@/components/mensal/NavegacaoMeses"
import { NovoLancamentoButton } from "@/components/mensal/NovoLancamentoButton"
import { EditarPlanejadoButton } from "@/components/mensal/EditarPlanejadoButton"
import { SaldoInicialDialog } from "@/components/mensal/SaldoInicialDialog"
import { ExportarPdfButton } from "@/components/mensal/ExportarPdfButton"
import { ControleMensalChart } from "@/components/mensal/ControleMensalChart"
import { Resumo503020 } from "@/components/mensal/Resumo503020"
import {
  agregarTotais,
  calcularSaldoAcumulado,
  formatarMoeda,
  type GrupoCategoria,
} from "@/lib/calculations"
import {
  GRUPO_LABEL,
  montarExtratoMensal,
  type CategoriaRow,
  type LancamentoRow,
  type OrcamentoRow,
} from "@/lib/extrato"
import { cn } from "@/lib/utils"

/**
 * Controle Mensal — **a tela mais prática do app**. Para o mês da rota:
 * 3 blocos (Renda, Despesa Fixa, Despesa Variável) com Planejado × Realizado ×
 * Diferença, gráfico em destaque, detalhamento por categoria e o resumo
 * 50‑30‑20. O investimento (aporte) entra no saldo e no resumo 50‑30‑20 — não
 * é um 4º bloco grande (decisão de UX alinhada à planilha, onde é o "20%").
 *
 * Server Component: só busca dados (RLS-enforced) e monta a UI. A agregação
 * vive em `lib/extrato.ts` (reusa `lib/calculations.ts`) — a mesma função
 * alimenta o PDF (Spec 11), então tela e extrato batem por construção.
 */

const MESES_NOMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const

/** Ícone de cada bloco. */
const ICONE_BLOCO: Record<Extract<GrupoCategoria, "renda" | "fixa" | "variavel">, LucideIcon> = {
  renda: Wallet,
  fixa: Receipt,
  variavel: ShoppingCart,
}

interface ObjetivoRow {
  id: string
  nome: string
}

/** Valida o segmento numérico do mês (1–12). */
function resolverMes(mesParam: string): number | null {
  const mes = Number(mesParam)
  return Number.isInteger(mes) && mes >= 1 && mes <= 12 ? mes : null
}

/** Valida o segmento do ano (2000–2100). */
function resolverAno(anoParam: string): number | null {
  const ano = Number(anoParam)
  return Number.isInteger(ano) && ano >= 2000 && ano <= 2100 ? ano : null
}

export default async function ControleMensalPage({
  params,
}: {
  params: Promise<{ subcontaId: string; ano: string; mes: string }>
}) {
  const { subcontaId, ano: anoParam, mes: mesParam } = await params
  const ano = resolverAno(anoParam)
  const mes = resolverMes(mesParam)
  if (ano === null || mes === null) {
    notFound()
  }

  const mm = String(mes).padStart(2, "0")
  const inicio = `${ano}-${mm}-01`
  // Limite superior exclusivo = 1º dia do mês seguinte (rola o ano em dezembro).
  const fimExclusivo =
    mes === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mes + 1).padStart(2, "0")}-01`

  const supabase = await createSupabaseServerClient()

  // Seis queries agregadas (sem N+1). RLS já escopa pela subconta.
  const [
    { data: lancamentosData },
    { data: orcamentosData },
    { data: categoriasData },
    { data: objetivosData },
    { data: historicoData },
    { data: subcontaData },
  ] = await Promise.all([
    supabase
      .from("lancamentos")
      .select("valor, categoria_id, grupo, objetivo_id")
      .eq("subconta_id", subcontaId)
      .gte("data", inicio)
      .lt("data", fimExclusivo),
    supabase
      .from("orcamentos")
      .select("categoria_id, valor_planejado, ano, mes")
      .eq("subconta_id", subcontaId),
    supabase
      .from("categorias")
      .select("id, nome, grupo, ordem")
      .eq("subconta_id", subcontaId)
      .order("ordem"),
    supabase
      .from("objetivos")
      .select("id, nome")
      .eq("subconta_id", subcontaId)
      .order("created_at"),
    // Histórico completo até o fim do mês (base do "Saldo em conta" acumulado).
    supabase
      .from("lancamentos")
      .select("valor, categoria_id, grupo")
      .eq("subconta_id", subcontaId)
      .lt("data", fimExclusivo),
    supabase
      .from("subcontas")
      .select("saldo_inicial")
      .eq("id", subcontaId)
      .maybeSingle(),
  ])

  const lancamentos = (lancamentosData ?? []) as unknown as LancamentoRow[]
  const orcamentos = (orcamentosData ?? []) as unknown as OrcamentoRow[]
  const categorias = (categoriasData ?? []) as unknown as CategoriaRow[]
  const objetivos = (objetivosData ?? []) as unknown as ObjetivoRow[]
  const historico = (historicoData ?? []) as unknown as Array<{
    valor: number
    categoria_id: string | null
    grupo: GrupoCategoria | null
  }>
  const saldoInicial = Number(subcontaData?.saldo_inicial ?? 0)

  // Agregação centralizada (mesma fonte do PDF de export — Spec 11).
  const extrato = montarExtratoMensal({
    ano,
    mes,
    categorias,
    lancamentos,
    orcamentos,
    objetivos,
  })

  // Planejado vigente por categoria (override do mês × recorrente herdado) —
  // reusa o `planejado` já resolvido em `categoriasAgregadas` (Spec 23). Mantém
  // a ordem de `categorias` (já ordenada por `ordem`).
  const planejadoPorCategoria = new Map(
    extrato.categoriasAgregadas.map((c) => [c.categoriaId, c.planejado])
  )
  const categoriasPlanejadas = categorias.map((c) => ({
    categoriaId: c.id,
    nome: c.nome,
    grupo: c.grupo,
    planejadoVigente: planejadoPorCategoria.get(c.id) ?? 0,
  }))

  // "Saldo em conta" (Spec 25): único número que depende do HISTÓRICO, não só do
  // mês. = saldo inicial + Σ(renda − fixa − variavel − investimento) de todos os
  // lançamentos até o fim do mês. O grupo vem da categoria; para o aporte sem
  // categoria (Spec 24), da coluna `grupo`. Sem grupo (aporte antigo) é ignorado.
  const grupoPorCategoria = new Map(categorias.map((c) => [c.id, c.grupo]))
  const historicoComGrupo = historico
    .map((l) => ({
      grupo: l.categoria_id ? grupoPorCategoria.get(l.categoria_id) ?? null : l.grupo,
      valor: Number(l.valor),
    }))
    .filter((l): l is { grupo: GrupoCategoria; valor: number } => l.grupo !== null)
  const saldoEmConta = calcularSaldoAcumulado(saldoInicial, [
    agregarTotais(historicoComGrupo),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      {/* Cabeçalho + ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Controle Mensal</h1>
          <p className="text-sm text-muted-foreground">
            {MESES_NOMES[mes - 1]} de {ano} — Planejado, Realizado e Diferença.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportarPdfButton subcontaId={subcontaId} ano={ano} mes={mes} />
          <EditarPlanejadoButton
            subcontaId={subcontaId}
            ano={ano}
            mes={mes}
            categorias={categoriasPlanejadas}
          />
          <NovoLancamentoButton
            subcontaId={subcontaId}
            categorias={categorias.map((c) => ({
              id: c.id,
              nome: c.nome,
              grupo: c.grupo,
            }))}
            objetivos={objetivos.map((o) => ({ id: o.id, nome: o.nome }))}
          />
        </div>
      </div>

      {/* Navegação por meses (mantém a subconta) */}
      <NavegacaoMeses subcontaId={subcontaId} ano={ano} mes={mes} />

      {/* Saldo do mês — "Saldo em conta" é acumulado (saldo inicial + histórico). */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SaldoCard rotulo="Saldo Planejado" valor={extrato.saldoPlanejado} />
        <SaldoCard
          rotulo="Saldo em conta"
          valor={saldoEmConta}
          rodape={<SaldoInicialDialog subcontaId={subcontaId} saldoInicial={saldoInicial} />}
        />
        <SaldoCard rotulo="Diferença" valor={extrato.saldoDiferenca} colorir />
      </div>

      {/* Gráfico em destaque */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planejado × Realizado por grupo</CardTitle>
          <CardDescription>
            Comparativo do mês entre o que foi planejado e o que foi realizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ControleMensalChart data={extrato.dadosGrafico} />
        </CardContent>
      </Card>

      {/* 3 blocos */}
      <div className="space-y-4">
        {extrato.blocos.map((bloco) => (
          <BlocoGrupo
            key={bloco.grupo}
            titulo={bloco.titulo}
            icone={ICONE_BLOCO[bloco.grupo]}
            linhas={bloco.linhas}
            total={bloco.total}
          />
        ))}
      </div>

      {/* Resumo 50‑30‑20 + detalhamento por categoria */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Resumo503020 rendaBase={extrato.rendaBase} faixas={extrato.faixas} />

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">Detalhamento por categoria</CardTitle>
            <CardDescription>
              Realizado de cada categoria e seu peso sobre a renda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {extrato.detalhamento.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum lançamento neste mês.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Planejado</TableHead>
                    <TableHead className="text-right">Realizado</TableHead>
                    <TableHead className="text-right">Diferença</TableHead>
                    <TableHead className="text-right">% da renda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extrato.detalhamento.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{GRUPO_LABEL[item.grupo]}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {formatarMoeda(item.planejado)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatarMoeda(item.realizado)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono font-medium tabular-nums",
                          corDiferenca(item.diferenca)
                        )}
                      >
                        {sinal(item.diferenca)}
                        {formatarMoeda(item.diferenca)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {item.percentualRenda.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Card de KPI do saldo. Quando `colorir`, pinta pela **convenção única**
 * (Spec 28): o valor já chega assinado pela favorabilidade → `+` verde,
 * `−` vermelho. Mesmos helpers dos blocos — sem função de cor duplicada.
 */
function SaldoCard({
  rotulo,
  valor,
  colorir = false,
  rodape,
}: {
  rotulo: string
  valor: number
  colorir?: boolean
  /** Slot opcional abaixo do valor (ex.: editar saldo inicial). */
  rodape?: ReactNode
}) {
  return (
    <Card size="sm">
      <CardHeader className="pb-0">
        <CardDescription>{rotulo}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <p
          className={cn(
            "font-mono text-xl font-semibold tabular-nums",
            colorir ? corDiferenca(valor) : "text-foreground"
          )}
        >
          {colorir ? sinal(valor) : ""}
          {formatarMoeda(valor)}
        </p>
        {rodape}
      </CardContent>
    </Card>
  )
}
