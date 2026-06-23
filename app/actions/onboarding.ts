'use server'

import { revalidatePath } from 'next/cache'
import { getUsuarioAtual } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { criarSubconta } from '@/app/actions/subcontas'

/**
 * Nome default da conta pessoal (Spec 20 · D3) — genérico e editável depois.
 * Nunca derivar de `profiles.nome`/`tipo_perfil` (era a origem do "Master").
 */
const NOME_PADRAO_PESSOAL = 'Minhas finanças'

/**
 * Onboarding por intenção (Spec 17 · RF-7/RF-11). Grava a **preferência de uso**
 * em `profiles.preferencia_inicial` — é só preferência + roteamento, não altera
 * `tipo_perfil` (todo educador segue `educador/ativo`).
 *
 * `null` = onboarding ainda não feito; `'pessoal'` = entrou para cuidar só das
 * próprias finanças (vira "lead" para o master); `'gestor'` = vai gerenciar
 * clientes.
 */

/**
 * Define a preferência no 1º acesso e devolve o destino que a UI deve navegar.
 *
 * - `'pessoal'`: garante a conta pessoal (cria só se ainda não existe, respeitando
 *   o limite da Spec 16) e devolve o destino do Controle Anual dela.
 * - `'gestor'`: devolve `/painel`.
 */
export async function definirPreferencia(pref: 'pessoal' | 'gestor') {
  const usuario = await getUsuarioAtual()
  if (!usuario) throw new Error('Não autenticado.')

  const supabase = await createSupabaseServerClient()

  // RLS de UPDATE do próprio perfil já permite (id = auth.uid()).
  const { error } = await supabase
    .from('profiles')
    .update({ preferencia_inicial: pref })
    .eq('id', usuario.id)

  if (error) {
    throw new Error(`Erro ao definir preferência: ${error.message}`)
  }

  let destino = '/painel'

  if (pref === 'pessoal') {
    // Reaproveita a pessoal já existente (evita erro do limite na 2ª tentativa).
    const { data: pessoal } = await supabase
      .from('subcontas')
      .select('id')
      .eq('tipo', 'pessoal')
      .eq('gestor_id', usuario.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (pessoal) {
      destino = `/${pessoal.id}/controle-anual`
    } else {
      // Default genérico (Spec 20 · D3) — mantém o onboarding de 1 clique e
      // nunca grava "Master"/nome do perfil. O usuário renomeia depois.
      const { subconta } = await criarSubconta('pessoal', NOME_PADRAO_PESSOAL)
      destino = `/${subconta.id}/controle-anual`
    }
  }

  revalidatePath('/painel')
  return { destino }
}

/**
 * Auto-upgrade pessoal → gestor (RF-11). Sem mudança de papel/claim: o usuário
 * **já é** `educador/ativo`; só passa a preferência para `'gestor'`, o que o
 * tira da lista de leads do master e o roteia para o `/painel`.
 */
export async function virarGestor() {
  const usuario = await getUsuarioAtual()
  if (!usuario) throw new Error('Não autenticado.')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('profiles')
    .update({ preferencia_inicial: 'gestor' })
    .eq('id', usuario.id)

  if (error) {
    throw new Error(`Erro ao virar gestor: ${error.message}`)
  }

  revalidatePath('/painel')
  return { ok: true as const }
}
