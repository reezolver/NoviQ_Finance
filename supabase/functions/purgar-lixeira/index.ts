// Spec 21 · RF-5c.4 / D7 — Purga automática da lixeira aos 90 dias.
//
// Edge Function agendada (1x/dia) que apaga, em definitivo, o que está na
// lixeira há mais de 90 dias — **dados E login** (`auth.users`), o que o
// pg_cron sozinho não consegue (não remove o login).
//
// Roda com a **service-role** (injetada nos secrets da função pelo Supabase —
// nunca commitada). Para cada subconta `cliente` vencida segue a ordem
// obrigatória da purga: desvincular anamnese → apagar a subconta (cascade) →
// apagar o login. Idem para `profiles` de gestores auto-excluídos (Spec 22).
//
// Deploy: MCP `deploy_edge_function`. Agendamento: pg_cron chamando esta função
// via `net.http_post(<function-url>, <service-role auth>)` — ver README de deploy.

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Proteção simples: exige o header Authorization (a service-role/anon do
  // agendador). Sem ela, recusa — a função não deve ser pública.
  const auth = req.headers.get('Authorization')
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Corte de retenção: 90 dias atrás, em ISO (comparável ao timestamptz).
  const corte = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const resultado = { subcontas: 0, profiles: 0, erros: [] as string[] }

  // ---- 1. Subcontas de cliente vencidas na lixeira ----
  const { data: subcontas, error: erroSel } = await admin
    .from('subcontas')
    .select('id, owner_user_id')
    .eq('tipo', 'cliente')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', corte)

  if (erroSel) {
    return new Response(JSON.stringify({ error: erroSel.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  for (const sub of subcontas ?? []) {
    try {
      // a) Desvincular anamneses (FK NO ACTION nos dois sentidos).
      const { error: e1 } = await admin
        .from('anamneses')
        .update({ subconta_id: null })
        .eq('subconta_id', sub.id)
      if (e1) throw new Error(`anamnese ${sub.id}: ${e1.message}`)

      const { error: e2 } = await admin
        .from('subcontas')
        .update({ origem_anamnese_id: null })
        .eq('id', sub.id)
      if (e2) throw new Error(`origem ${sub.id}: ${e2.message}`)

      // b) Apagar a subconta (cascateia as tabelas-filhas).
      const { error: e3 } = await admin.from('subcontas').delete().eq('id', sub.id)
      if (e3) throw new Error(`subconta ${sub.id}: ${e3.message}`)

      // c) Apagar o login do cliente.
      if (sub.owner_user_id) {
        const { error: e4 } = await admin.auth.admin.deleteUser(sub.owner_user_id)
        if (e4) throw new Error(`login ${sub.owner_user_id}: ${e4.message}`)
      }

      resultado.subcontas++
    } catch (err) {
      resultado.erros.push(err instanceof Error ? err.message : String(err))
    }
  }

  // ---- 2. Profiles de gestores auto-excluídos vencidos (Spec 22) ----
  const { data: perfis, error: erroPerfis } = await admin
    .from('profiles')
    .select('id')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', corte)

  if (!erroPerfis) {
    for (const p of perfis ?? []) {
      try {
        // Apagar o login do gestor remove o `profiles` por cascade (FK
        // profiles.id → auth.users.id ON DELETE CASCADE) e zera o gestor_id dos
        // clientes (FK ON DELETE SET NULL → eles caem no pool).
        const { error } = await admin.auth.admin.deleteUser(p.id)
        if (error) throw new Error(`gestor ${p.id}: ${error.message}`)
        resultado.profiles++
      } catch (err) {
        resultado.erros.push(err instanceof Error ? err.message : String(err))
      }
    }
  } else {
    resultado.erros.push(erroPerfis.message)
  }

  return new Response(JSON.stringify(resultado), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
