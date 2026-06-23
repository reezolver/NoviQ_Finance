import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

/**
 * **Purga completa de uma subconta `cliente`** — destrutiva e irreversível.
 *
 * Centraliza a ordem obrigatória (Spec 21 · RF-5.2.1) reutilizada por três
 * caminhos: exclusão **permanente** imediata, **purga automática aos 90 dias**
 * (Edge Function) e a auto-exclusão de gestor (Spec 22).
 *
 * Ordem (não pode mudar):
 *  1. **Desvincular anamneses** — as FKs `anamneses.subconta_id` e
 *     `subcontas.origem_anamnese_id` são `ON DELETE NO ACTION`; sem desvincular,
 *     o `delete` da subconta falha. Feito via **admin** porque a anamnese
 *     pertence ao educador que a enviou (RLS `gestor_id = auth.uid()`) e o master
 *     que purga não conseguiria atualizá-la pelo client de usuário.
 *  2. **Excluir a subconta** — cascateia categorias/lançamentos/dívidas/
 *     objetivos/orçamentos/patrimônio. Roda pelo **client de usuário** (a policy
 *     de DELETE autoriza gestor dono ou master) quando fornecido; senão, admin
 *     (caso da Edge Function, que não tem sessão de usuário).
 *  3. **Excluir o login** do cliente em `auth.users` (admin), por último, para
 *     não esbarrar na FK `owner_user_id` (NO ACTION) enquanto a subconta existe.
 *
 * @param admin    client service-role (bypassa RLS).
 * @param db       client que executa o DELETE da subconta. Passe o client de
 *                 usuário (RLS) quando houver sessão; passe o `admin` em jobs.
 * @param subcontaId  id da subconta a purgar.
 * @param ownerUserId login do cliente (`auth.users`) ou null se ainda não criado.
 */
export async function purgarSubcontaCliente(
  admin: Client,
  db: Client,
  subcontaId: string,
  ownerUserId: string | null
): Promise<void> {
  // 1. Desvincular anamneses (FK NO ACTION nos dois sentidos) — via admin.
  const { error: erroAnamnese } = await admin
    .from('anamneses')
    .update({ subconta_id: null })
    .eq('subconta_id', subcontaId)
  if (erroAnamnese) {
    throw new Error(`Erro ao desvincular anamnese: ${erroAnamnese.message}`)
  }

  const { error: erroOrigem } = await admin
    .from('subcontas')
    .update({ origem_anamnese_id: null })
    .eq('id', subcontaId)
  if (erroOrigem) {
    throw new Error(`Erro ao limpar origem da anamnese: ${erroOrigem.message}`)
  }

  // 2. Excluir a subconta (cascateia as tabelas-filhas).
  const { error: erroSubconta } = await db
    .from('subcontas')
    .delete()
    .eq('id', subcontaId)
  if (erroSubconta) {
    throw new Error(`Erro ao excluir a subconta: ${erroSubconta.message}`)
  }

  // 3. Excluir o login do cliente (por último).
  if (ownerUserId) {
    const { error: erroLogin } = await admin.auth.admin.deleteUser(ownerUserId)
    if (erroLogin) {
      throw new Error(`Subconta excluída, mas falhou ao remover o login: ${erroLogin.message}`)
    }
  }
}

/**
 * **Auto-exclusão permanente de um gestor** (Spec 22 · RF-4.4) — destrutiva e
 * irreversível. Apaga as carteiras **pessoais** do próprio usuário + seus dados,
 * e por fim o login. Os **clientes** (`tipo='cliente'`) **não** são apagados: a
 * FK `subcontas.gestor_id → auth.users ON DELETE SET NULL` os transforma em
 * "não atribuídos" (pool do master, D1) no instante em que o login some.
 *
 * Tudo roda pelo **admin** (service-role): não há policy de DELETE para
 * subcontas `pessoal` (a da Spec 21 só cobre `cliente`), e o `auth.users` exige
 * privilégio admin. A ordem espelha a de {@link purgarSubcontaCliente}:
 *
 *  1. Para cada **pessoal**: desvincular anamneses (FKs NO ACTION nos dois
 *     sentidos) e excluir a subconta (cascateia os dados-filhos).
 *  2. Excluir o **login** em `auth.users` por último — só então a FK
 *     `owner_user_id` (NO ACTION) das pessoais já não aponta para ele, e o
 *     `profiles` some via `ON DELETE CASCADE`.
 *
 * @param admin   client service-role (bypassa RLS).
 * @param userId  id do usuário (`auth.users`/`profiles`) que se auto-exclui.
 */
export async function purgarContaPropria(
  admin: Client,
  userId: string
): Promise<void> {
  // 1. Carteiras pessoais do gestor (owner_user_id = userId).
  const { data: pessoais, error: erroLista } = await admin
    .from('subcontas')
    .select('id')
    .eq('gestor_id', userId)
    .eq('tipo', 'pessoal')
  if (erroLista) {
    throw new Error(`Erro ao listar contas pessoais: ${erroLista.message}`)
  }

  for (const sub of pessoais ?? []) {
    const { error: erroAnamnese } = await admin
      .from('anamneses')
      .update({ subconta_id: null })
      .eq('subconta_id', sub.id)
    if (erroAnamnese) {
      throw new Error(`Erro ao desvincular anamnese: ${erroAnamnese.message}`)
    }

    const { error: erroOrigem } = await admin
      .from('subcontas')
      .update({ origem_anamnese_id: null })
      .eq('id', sub.id)
    if (erroOrigem) {
      throw new Error(`Erro ao limpar origem da anamnese: ${erroOrigem.message}`)
    }

    const { error: erroSubconta } = await admin
      .from('subcontas')
      .delete()
      .eq('id', sub.id)
    if (erroSubconta) {
      throw new Error(`Erro ao excluir a conta pessoal: ${erroSubconta.message}`)
    }
  }

  // 2. Excluir o login (por último). `profiles` cai por ON DELETE CASCADE; os
  //    clientes viram pool (gestor_id → null) por ON DELETE SET NULL.
  const { error: erroLogin } = await admin.auth.admin.deleteUser(userId)
  if (erroLogin) {
    throw new Error(`Contas pessoais excluídas, mas falhou ao remover o login: ${erroLogin.message}`)
  }
}
