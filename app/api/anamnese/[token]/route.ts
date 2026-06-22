import { NextResponse, type NextRequest } from 'next/server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { calcularAnaliseAnamnese, submissaoSchema } from '@/lib/anamnese'
import type { Json } from '@/types/database'

/**
 * Submissão **pública** da anamnese (Spec 08 §3).
 *
 * O lead nunca lê a tabela `anamneses` (RLS travada em `gestor_id`): este
 * handler usa a **service-role** (`createSupabaseAdminClient`) só para validar o
 * `token`, calcular o diagnóstico no servidor e gravar. Sem auth.
 *
 * Regras:
 * - token inválido/inexistente → 404.
 * - anamnese já preenchida → 409 (link de uso único).
 * - consentimento LGPD ausente → 422 (não grava).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (!token) {
    return NextResponse.json({ error: 'Token ausente.' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  const parsed = submissaoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos.', detalhes: parsed.error.flatten() },
      { status: 422 }
    )
  }
  const { respostas, consentimento } = parsed.data

  if (!consentimento) {
    return NextResponse.json(
      { error: 'É necessário aceitar o consentimento (LGPD) para enviar.' },
      { status: 422 }
    )
  }

  const admin = createSupabaseAdminClient()

  // Valida o token. `status` controla o uso único do link.
  const { data: anamnese, error: erroLeitura } = await admin
    .from('anamneses')
    .select('id, status')
    .eq('token', token)
    .maybeSingle()

  if (erroLeitura) {
    return NextResponse.json({ error: 'Erro ao validar o link.' }, { status: 500 })
  }
  if (!anamnese) {
    return NextResponse.json({ error: 'Link inválido ou expirado.' }, { status: 404 })
  }
  if (anamnese.status === 'preenchida') {
    return NextResponse.json({ error: 'Esta anamnese já foi enviada.' }, { status: 409 })
  }

  // Diagnóstico calculado no servidor a partir das respostas.
  const analise = calcularAnaliseAnamnese(respostas)
  const agora = new Date().toISOString()

  const { error: erroGravacao } = await admin
    .from('anamneses')
    .update({
      respostas: respostas as unknown as Json,
      analise: analise as unknown as Json,
      status: 'preenchida',
      preenchida_at: agora,
      consentimento_at: agora,
    })
    .eq('id', anamnese.id)
    .eq('status', 'enviada') // guarda contra corrida (uso único)

  if (erroGravacao) {
    return NextResponse.json({ error: 'Erro ao salvar a anamnese.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
