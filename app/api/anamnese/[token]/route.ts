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
 *
 * **Contrato de erro (Spec 29 §3.2):** o 422 devolve `detalhes` — uma lista
 * `{ campo, mensagem }` em que `campo` é o **caminho do campo no formulário**
 * (ex.: `pessoal.email`, `dependentes.0.idade`), pronto para o `setError` do
 * react-hook-form. O `flatten()` do zod não serve aqui: ele achata só o
 * primeiro nível e devolveria tudo sob a chave `respostas`, sem dizer qual
 * campo falhou. ⚠️ Rota pública: `detalhes` carrega **só** mensagem de zod —
 * nunca erro do Postgres, nome de coluna ou stack (R6).
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
    // `path` do zod → caminho do campo no formulário. O prefixo `respostas`
    // existe só no corpo do POST; o form tem esses campos na raiz.
    const detalhes = parsed.error.issues.map((issue) => {
      const caminho = issue.path[0] === 'respostas' ? issue.path.slice(1) : issue.path
      return { campo: caminho.join('.'), mensagem: issue.message }
    })
    return NextResponse.json(
      { error: 'Confira os campos destacados e envie de novo.', detalhes },
      { status: 422 }
    )
  }
  const { respostas, consentimento } = parsed.data

  // Consentimento continua obrigatório (R7) — mas erra no campo, não em geral.
  if (!consentimento) {
    return NextResponse.json(
      {
        error: 'É necessário aceitar o consentimento (LGPD) para enviar.',
        detalhes: [
          {
            campo: 'consentimento',
            mensagem: 'É necessário aceitar para enviar.',
          },
        ],
      },
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
    // Log do erro REAL do Supabase (R5) — só no servidor (Vercel), nunca na
    // resposta: a rota é pública (R6).
    console.error('[anamnese] falha ao ler o token:', erroLeitura.message)
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

  const { error: erroGravacao, count } = await admin
    .from('anamneses')
    .update(
      {
        respostas: respostas as unknown as Json,
        analise: analise as unknown as Json,
        status: 'preenchida',
        preenchida_at: agora,
        consentimento_at: agora,
      },
      { count: 'exact' }
    )
    .eq('id', anamnese.id)
    .eq('status', 'enviada') // guarda contra corrida (uso único)

  if (erroGravacao) {
    console.error('[anamnese] falha ao gravar:', erroGravacao.message)
    return NextResponse.json({ error: 'Erro ao salvar a anamnese.' }, { status: 500 })
  }

  // A guarda de corrida casou 0 linhas: outra submissão do MESMO link chegou
  // primeiro. Sem esta checagem o lead veria "enviada com sucesso" sem nada ter
  // sido gravado. Mesmo tratamento do 409 (link de uso único).
  if (count === 0) {
    return NextResponse.json({ error: 'Esta anamnese já foi enviada.' }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
