import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Cliente Supabase com a **service-role key** — server-only.
 *
 * ⚠️ Este client **bypassa a RLS**. Use exclusivamente dentro de Server
 * Actions / Route Handlers, e somente para operações privilegiadas que o
 * client de usuário não consegue fazer (criar login de cliente, ler perfis
 * por id durante o auto-cadastro de educador, submissão pública de anamnese).
 *
 * A `SUPABASE_SERVICE_ROLE_KEY` **nunca** pode aparecer em `NEXT_PUBLIC_*`
 * nem ser importada por um client component — o `import 'server-only'` acima
 * quebra o build caso isso aconteça.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
