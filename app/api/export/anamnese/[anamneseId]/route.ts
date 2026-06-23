import { NextResponse, type NextRequest } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { respostasSchema } from "@/lib/anamnese"
import { AnamnesePdf } from "@/components/pdf/AnamnesePdf"

/**
 * Exportação da **anamnese preenchida em PDF** — as respostas do cliente.
 *
 * `@react-pdf/renderer` no runtime **Node** (não Edge). **Acesso validado no
 * servidor:** a query usa o client de usuário (RLS). A policy de SELECT de
 * `anamneses` (`gestor_id = auth.uid()`) só devolve as anamneses do próprio
 * gestor — se a id não for dele (ou não existir), vem `null` → 404. Nunca
 * decidimos acesso no frontend.
 *
 * Difere de `GET /api/export/[subcontaId]?tipo=diagnostico` (que exporta o
 * **diagnóstico** calculado): aqui exportamos as **respostas** cruas, e a
 * anamnese **não precisa** ter virado subconta.
 */
export const runtime = "nodejs"

/** Slug ASCII para o nome do arquivo (Content-Disposition). */
function slugify(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "anamnese"
  )
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ anamneseId: string }> }
) {
  const { anamneseId } = await params
  const supabase = await createSupabaseServerClient()

  // Validação de acesso (RLS): se não vier a anamnese, a policy negou → 404.
  const { data: anamnese } = await supabase
    .from("anamneses")
    .select("id, nome_lead, email_lead, status, preenchida_at, respostas")
    .eq("id", anamneseId)
    .maybeSingle()

  if (!anamnese) {
    return NextResponse.json(
      { error: "Anamnese não encontrada ou sem acesso." },
      { status: 404 }
    )
  }

  if (anamnese.status !== "preenchida") {
    return NextResponse.json(
      { error: "Esta anamnese ainda não foi preenchida." },
      { status: 409 }
    )
  }

  // As respostas foram validadas na submissão; reparseamos para normalizar
  // defaults e garantir a forma esperada pelo template.
  const parse = respostasSchema.safeParse(anamnese.respostas)
  if (!parse.success) {
    return NextResponse.json(
      { error: "Respostas da anamnese em formato inválido." },
      { status: 422 }
    )
  }

  const geradoEm = new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })
  const preenchidaEm = anamnese.preenchida_at
    ? new Date(anamnese.preenchida_at).toLocaleDateString("pt-BR")
    : null

  // Template puro (sem hooks): chamá-lo devolve o `<Document>` que
  // `renderToBuffer` espera (em .ts, sem JSX).
  const buffer = await renderToBuffer(
    AnamnesePdf({
      nomeLead: anamnese.nome_lead,
      emailLead: anamnese.email_lead,
      preenchidaEm,
      respostas: parse.data,
      geradoEm,
    })
  )

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="anamnese-${slugify(anamnese.nome_lead)}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
