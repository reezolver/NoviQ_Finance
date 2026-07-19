import { NextResponse, type NextRequest } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  agregarTotais,
  calcularSaldoAcumulado,
  type GrupoCategoria,
} from "@/lib/calculations"
import {
  montarExtratoMensal,
  type CategoriaRow,
  type LancamentoRow,
  type ObjetivoRow,
  type OrcamentoRow,
} from "@/lib/extrato"
import type { AnaliseAnamnese } from "@/lib/anamnese"
import { ExtratoMensalPdf } from "@/components/pdf/ExtratoMensalPdf"
import { DiagnosticoPdf } from "@/components/pdf/DiagnosticoPdf"

/**
 * Exportação de PDF (Spec 11) — extrato mensal ou diagnóstico da anamnese.
 *
 * `@react-pdf/renderer` (sem browser headless → amigável a serverless). Roda no
 * runtime **Node** (precisa de APIs de Node, não Edge).
 *
 * **Acesso validado no servidor:** todas as queries usam o client de usuário
 * (RLS-enforced). Se `subcontas` não devolver a subconta da URL, a RLS negou
 * (`can_access_subconta`) ou o id não existe → 404. Nunca decidimos acesso no
 * frontend e **não vazamos dados de outra subconta**.
 *
 * Query string:
 * - `tipo` = `extrato` (padrão) | `diagnostico`
 * - `ano`, `mes` (apenas para o extrato; padrão = mês atual)
 */
export const runtime = "nodejs"

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

/** Slug ASCII para o nome do arquivo (Content-Disposition). */
function slugify(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "subconta"
  )
}

/** Resposta de download a partir de um buffer de PDF. */
function pdfResponse(buffer: Buffer, filename: string): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subcontaId: string }> }
) {
  const { subcontaId } = await params
  const supabase = await createSupabaseServerClient()

  // Validação de acesso (RLS): se não vier a subconta, a policy negou → 404.
  const { data: subconta } = await supabase
    .from("subcontas")
    .select("id, nome, origem_anamnese_id")
    .eq("id", subcontaId)
    .maybeSingle()

  if (!subconta) {
    return NextResponse.json(
      { error: "Subconta não encontrada ou sem acesso." },
      { status: 404 }
    )
  }

  const tipo = request.nextUrl.searchParams.get("tipo") ?? "extrato"
  const geradoEm = new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })

  // ── Diagnóstico da anamnese ────────────────────────────────────────────────
  if (tipo === "diagnostico") {
    if (!subconta.origem_anamnese_id) {
      return NextResponse.json(
        { error: "Esta subconta não possui diagnóstico de anamnese." },
        { status: 404 }
      )
    }

    const { data: anamnese } = await supabase
      .from("anamneses")
      .select("analise")
      .eq("id", subconta.origem_anamnese_id)
      .maybeSingle()

    if (!anamnese?.analise) {
      return NextResponse.json(
        { error: "Diagnóstico não disponível para esta subconta." },
        { status: 404 }
      )
    }

    // Os templates PDF são puros (sem hooks): chamá-los devolve o `<Document>`
    // que `renderToBuffer` espera (em .ts, sem JSX).
    const buffer = await renderToBuffer(
      DiagnosticoPdf({
        subcontaNome: subconta.nome,
        analise: anamnese.analise as unknown as AnaliseAnamnese,
        geradoEm,
      })
    )
    return pdfResponse(buffer, `diagnostico-${slugify(subconta.nome)}.pdf`)
  }

  // ── Extrato mensal (padrão) ──────────────────────────────────────────────────
  const agora = new Date()
  const anoParam = Number(request.nextUrl.searchParams.get("ano"))
  const mesParam = Number(request.nextUrl.searchParams.get("mes"))
  const ano =
    Number.isInteger(anoParam) && anoParam >= 2000 && anoParam <= 2100
      ? anoParam
      : agora.getFullYear()
  const mes =
    Number.isInteger(mesParam) && mesParam >= 1 && mesParam <= 12
      ? mesParam
      : agora.getMonth() + 1

  const mm = String(mes).padStart(2, "0")
  const inicio = `${ano}-${mm}-01`
  const fimExclusivo =
    mes === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mes + 1).padStart(2, "0")}-01`

  // Mesmas queries da tela mensal (Spec 04). RLS já escopa pela subconta.
  const [
    { data: lancamentosData },
    { data: orcamentosData },
    { data: categoriasData },
    { data: objetivosData },
    { data: historicoData },
    { data: subcontaSaldoData },
  ] = await Promise.all([
    supabase
      .from("lancamentos")
      .select("valor, categoria_id, grupo, objetivo_id")
      // Spec 37: soft delete — lancamento excluido some de toda leitura.
      .is("deleted_at", null)
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
      .eq("subconta_id", subcontaId),
    // Histórico completo até o fim do mês + saldo inicial (Saldo em conta).
    supabase
      .from("lancamentos")
      .select("valor, categoria_id, grupo")
      // Spec 37: soft delete — lancamento excluido some de toda leitura.
      .is("deleted_at", null)
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
  const saldoInicial = Number(subcontaSaldoData?.saldo_inicial ?? 0)

  // Mesma agregação da tela → os números do PDF batem com a tela (Spec 11 §4).
  const extrato = montarExtratoMensal({
    ano,
    mes,
    categorias,
    lancamentos,
    orcamentos,
    objetivos,
  })

  // "Saldo em conta" acumulado — calculado fora de montarExtratoMensal (que só
  // conhece o mês), igual à tela mensal (Spec 25).
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

  const buffer = await renderToBuffer(
    ExtratoMensalPdf({
      subcontaNome: subconta.nome,
      mesNome: MESES_NOMES[mes - 1],
      ano,
      extrato,
      saldoEmConta,
      geradoEm,
    })
  )

  return pdfResponse(buffer, `extrato-${slugify(subconta.nome)}-${ano}-${mm}.pdf`)
}
