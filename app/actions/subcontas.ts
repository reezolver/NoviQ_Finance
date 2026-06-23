'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { assertGestor, assertMaster } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { purgarSubcontaCliente } from '@/lib/exclusao'
import type { Database } from '@/types/database'

/**
 * Ban "permanente" (≈100 anos) aplicado ao login do cliente na exclusão
 * temporária — ele para de entrar na hora e volta a entrar ao restaurar.
 * O Supabase Auth espera uma duração no formato Go (`876000h`).
 */
const BAN_DURACAO = '876000h'

type GrupoCategoria = Database['public']['Enums']['grupo_categoria']

/**
 * Taxonomia-semente — **fonte de verdade: a planilha**.
 * Total = 11 categorias default. Atenção: Transporte/Alimentação/Lazer/Uber
 * nascem como `variavel` (não `fixa`). `ordem` é sequencial (1..11).
 */
const CATEGORIAS_DEFAULT: ReadonlyArray<{ nome: string; grupo: GrupoCategoria }> = [
  { nome: 'Salário', grupo: 'renda' },
  { nome: 'Investimentos', grupo: 'renda' }, // rendimento que entra
  { nome: 'Aluguel', grupo: 'fixa' },
  { nome: 'Internet', grupo: 'fixa' },
  { nome: 'Gás', grupo: 'fixa' },
  { nome: 'Seguro', grupo: 'fixa' },
  { nome: 'Transporte', grupo: 'variavel' },
  { nome: 'Alimentação', grupo: 'variavel' },
  { nome: 'Lazer', grupo: 'variavel' },
  { nome: 'Uber', grupo: 'variavel' },
  { nome: 'Aporte', grupo: 'investimento' },
]

const criarSubcontaSchema = z.object({
  tipo: z.enum(['pessoal', 'cliente']),
  nome: z.string().trim().min(1, 'Nome é obrigatório.'),
  ownerEmail: z.string().email().optional(),
})

/**
 * Tetos fixos de subcontas por gestor (Spec 16 · RF-8). Não atrelados a billing
 * — MVP. O trigger `trg_limite_subcontas` no banco é a fonte de verdade; esta
 * checagem na app é UX + defesa em profundidade. Os dois usam os mesmos valores.
 */
const LIMITES = { pessoal: 1, cliente: 3 } as const

/**
 * Cria uma subconta (carteira) e **semeia as categorias default**.
 *
 * - `pessoal`: `owner_user_id = gestor_id` (não tem login próprio).
 * - `cliente`: `owner_user_id = null` até o login ser criado via
 *   {@link criarLoginCliente}. Se `ownerEmail` vier, é retornado para a UI
 *   encadear a criação do login (que exige senha).
 *
 * Roda pelo client de usuário (RLS-enforced): a policy de INSERT de
 * `subcontas` exige `gestor_id = auth.uid()` e a de `categorias` valida via
 * `can_access_subconta`. O `assertGestor()` é a checagem de papel na camada
 * de aplicação (defesa em profundidade).
 */
export async function criarSubconta(
  tipo: 'pessoal' | 'cliente',
  nome: string,
  ownerEmail?: string
) {
  const dados = criarSubcontaSchema.parse({ tipo, nome, ownerEmail })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  // Limite por gestor (Spec 16 · RF-8): barra antes do insert. Conta roda pelo
  // client de usuário (RLS) — as subcontas do gestor já são visíveis a ele. A UI
  // captura este `Error` e mostra `toast`. O trigger do banco é a barreira final.
  const { count } = await supabase
    .from('subcontas')
    .select('id', { count: 'exact', head: true })
    .eq('gestor_id', gestor.id)
    .eq('tipo', dados.tipo)

  if ((count ?? 0) >= LIMITES[dados.tipo]) {
    throw new Error(
      dados.tipo === 'pessoal'
        ? 'Você já tem uma conta pessoal.'
        : `Você atingiu o limite de ${LIMITES.cliente} contas de cliente.`
    )
  }

  const { data: subconta, error } = await supabase
    .from('subcontas')
    .insert({
      tipo: dados.tipo,
      nome: dados.nome,
      gestor_id: gestor.id,
      owner_user_id: dados.tipo === 'pessoal' ? gestor.id : null,
    })
    .select('id, tipo, nome, gestor_id, owner_user_id')
    .single()

  if (error || !subconta) {
    throw new Error(`Erro ao criar subconta: ${error?.message ?? 'desconhecido'}`)
  }

  const categorias = CATEGORIAS_DEFAULT.map((categoria, indice) => ({
    subconta_id: subconta.id,
    nome: categoria.nome,
    grupo: categoria.grupo,
    is_default: true,
    ordem: indice + 1,
  }))

  const { error: erroCategorias } = await supabase.from('categorias').insert(categorias)
  if (erroCategorias) {
    throw new Error(`Erro ao semear categorias: ${erroCategorias.message}`)
  }

  revalidatePath('/painel')
  return { subconta, ownerEmail: dados.ownerEmail ?? null }
}

const criarLoginClienteSchema = z.object({
  subcontaId: z.string().uuid(),
  email: z.string().email(),
  senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
})

/**
 * Cria o **login do cliente** (identidade em `auth.users`) e o vincula como
 * dono da subconta. Usa a service-role (admin) com `email_confirm: true` —
 * resolve o atrito de confirmação de email: o cliente loga direto.
 */
export async function criarLoginCliente(
  subcontaId: string,
  email: string,
  senha: string
) {
  const dados = criarLoginClienteSchema.parse({ subcontaId, email, senha })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  // A RLS de `subcontas` já filtra o que o gestor/master enxerga; a checagem
  // explícita abaixo é defesa em profundidade.
  const { data: subconta } = await supabase
    .from('subcontas')
    .select('id, gestor_id, tipo')
    .eq('id', dados.subcontaId)
    .single()

  if (!subconta) {
    throw new Error('Subconta não encontrada ou sem acesso.')
  }
  const isMaster = gestor.tipo_perfil === 'master'
  if (!isMaster && subconta.gestor_id !== gestor.id) {
    throw new Error('Sem permissão para criar login nesta subconta.')
  }

  const admin = createSupabaseAdminClient()
  const { data: criado, error: erroCriacao } = await admin.auth.admin.createUser({
    email: dados.email,
    password: dados.senha,
    email_confirm: true,
    app_metadata: { tipo_perfil: 'cliente', status: 'ativo' },
  })

  if (erroCriacao || !criado.user) {
    throw new Error(`Erro ao criar login: ${erroCriacao?.message ?? 'desconhecido'}`)
  }

  const { error: erroVinculo } = await supabase
    .from('subcontas')
    .update({ owner_user_id: criado.user.id })
    .eq('id', dados.subcontaId)

  if (erroVinculo) {
    throw new Error(`Login criado, mas falhou ao vincular à subconta: ${erroVinculo.message}`)
  }

  revalidatePath('/painel')
  return { userId: criado.user.id, email: dados.email }
}

const renomearSubcontaSchema = z.object({
  subcontaId: z.string().uuid(),
  nome: z.string().trim().min(1, 'Nome é obrigatório.').max(60, 'Nome muito longo.'),
})

/**
 * Renomeia uma subconta (Spec 20 · RF-3.2). Desacopla o **nome da conta**
 * (`subcontas.nome`) do nome/tipo do usuário — sem mudança de schema.
 *
 * Permissão: a conta `pessoal` só pode ser renomeada pelo próprio dono; a
 * `cliente`, pelo gestor dono ou pelo master. **Nunca** a `pessoal` alheia
 * (privacidade). A RLS de `UPDATE` (`gestor_id = auth.uid() OR is_master()`) é
 * a barreira real; a checagem explícita abaixo é defesa em profundidade.
 */
export async function renomearSubconta(subcontaId: string, nome: string) {
  const dados = renomearSubcontaSchema.parse({ subcontaId, nome })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  // Defesa em profundidade: confirma posse/tipo antes do update (a RLS é a barreira real).
  const { data: sub } = await supabase
    .from('subcontas')
    .select('id, tipo, gestor_id, owner_user_id')
    .eq('id', dados.subcontaId)
    .maybeSingle()
  if (!sub) throw new Error('Subconta não encontrada ou sem acesso.')

  // Master pode renomear clientes, mas não a pessoal alheia (coerente com a RLS).
  const isMaster = gestor.tipo_perfil === 'master'
  const ehMinhaPessoal = sub.tipo === 'pessoal' && sub.gestor_id === gestor.id
  const ehClienteQuePosso =
    sub.tipo === 'cliente' && (sub.gestor_id === gestor.id || isMaster)
  if (!ehMinhaPessoal && !ehClienteQuePosso) {
    throw new Error('Sem permissão para renomear esta conta.')
  }

  const { error } = await supabase
    .from('subcontas')
    .update({ nome: dados.nome })
    .eq('id', dados.subcontaId)
  if (error) throw new Error(`Erro ao renomear: ${error.message}`)

  revalidatePath('/painel')
  return { ok: true as const }
}

const definirSaldoInicialSchema = z.object({
  subcontaId: z.string().uuid(),
  // Saldo de partida: aceita negativo (conta pode começar no vermelho).
  valor: z.number({ error: 'Informe um valor.' }).finite('Valor inválido.'),
})

/**
 * Define o **saldo inicial** da subconta (Spec 25 · RF-4) — base do "Saldo em
 * conta" acumulado. Aceita negativo.
 *
 * Permissão idêntica ao {@link renomearSubconta}: a `pessoal` só pelo próprio
 * dono; a `cliente` pelo gestor dono ou master; **nunca** a `pessoal` alheia. A
 * RLS de UPDATE (`gestor_id = auth.uid() OR is_master()`) é a barreira real; a
 * checagem abaixo é defesa em profundidade.
 */
export async function definirSaldoInicial(subcontaId: string, valor: number) {
  const dados = definirSaldoInicialSchema.parse({ subcontaId, valor })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  const { data: sub } = await supabase
    .from('subcontas')
    .select('id, tipo, gestor_id, owner_user_id')
    .eq('id', dados.subcontaId)
    .maybeSingle()
  if (!sub) throw new Error('Subconta não encontrada ou sem acesso.')

  const isMaster = gestor.tipo_perfil === 'master'
  const ehMinhaPessoal = sub.tipo === 'pessoal' && sub.gestor_id === gestor.id
  const ehClienteQuePosso =
    sub.tipo === 'cliente' && (sub.gestor_id === gestor.id || isMaster)
  if (!ehMinhaPessoal && !ehClienteQuePosso) {
    throw new Error('Sem permissão para editar o saldo inicial desta conta.')
  }

  const { error } = await supabase
    .from('subcontas')
    .update({ saldo_inicial: dados.valor })
    .eq('id', dados.subcontaId)
  if (error) throw new Error(`Erro ao salvar o saldo inicial: ${error.message}`)

  // O "Saldo em conta" aparece no Mensal e no Anual — revalida os dois.
  revalidatePath('/[subcontaId]/mensal/[ano]/[mes]', 'page')
  revalidatePath('/[subcontaId]/controle-anual', 'page')
  return { ok: true as const }
}

const definirCustoEssencialSchema = z.object({
  subcontaId: z.string().uuid(),
  // >= 0 para informar; null para limpar (volta a meta 0).
  valor: z.number().min(0, 'O valor não pode ser negativo.').nullable(),
})

/**
 * Define o **custo de vida essencial** mensal da subconta (Spec 26 · RF-5) —
 * base da meta de reserva de emergência (6×). `null` limpa o valor (meta 0).
 *
 * Permissão idêntica ao {@link renomearSubconta}/{@link definirSaldoInicial}: a
 * `pessoal` só pelo próprio dono; a `cliente` pelo gestor dono ou master;
 * **nunca** a `pessoal` alheia. A RLS de UPDATE é a barreira real.
 */
export async function definirCustoVidaEssencial(
  subcontaId: string,
  valor: number | null
) {
  const dados = definirCustoEssencialSchema.parse({ subcontaId, valor })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  const { data: sub } = await supabase
    .from('subcontas')
    .select('id, tipo, gestor_id, owner_user_id')
    .eq('id', dados.subcontaId)
    .maybeSingle()
  if (!sub) throw new Error('Subconta não encontrada ou sem acesso.')

  const isMaster = gestor.tipo_perfil === 'master'
  const ehMinhaPessoal = sub.tipo === 'pessoal' && sub.gestor_id === gestor.id
  const ehClienteQuePosso =
    sub.tipo === 'cliente' && (sub.gestor_id === gestor.id || isMaster)
  if (!ehMinhaPessoal && !ehClienteQuePosso) {
    throw new Error('Sem permissão para editar o custo essencial desta conta.')
  }

  const { error } = await supabase
    .from('subcontas')
    .update({ custo_vida_essencial: dados.valor })
    .eq('id', dados.subcontaId)
  if (error) throw new Error(`Erro ao salvar o custo essencial: ${error.message}`)

  revalidatePath('/[subcontaId]/investimentos', 'page')
  return { ok: true as const }
}

const moverClienteSchema = z.object({
  subcontaId: z.string().uuid(),
  novoGestorId: z.string().uuid(),
})

/**
 * Move um cliente entre gestores — **só master** (Spec 07).
 *
 * Atualiza `subcontas.gestor_id`. A RLS de `subcontas` (UPDATE: `gestor_id =
 * auth.uid() OR is_master()`) já autoriza o master; o `assertMaster()` é
 * defesa em profundidade na camada de aplicação.
 *
 * Garante que o **cliente nunca fica órfão**: valida que a subconta é do tipo
 * `cliente` e que `novoGestorId` corresponde a um gestor real (educador ou
 * master). Master lê `profiles` de qualquer um via RLS (`is_master()`).
 */
export async function moverCliente(subcontaId: string, novoGestorId: string) {
  const dados = moverClienteSchema.parse({ subcontaId, novoGestorId })
  await assertMaster()
  const supabase = await createSupabaseServerClient()

  const { data: subconta } = await supabase
    .from('subcontas')
    .select('id, tipo, gestor_id')
    .eq('id', dados.subcontaId)
    .maybeSingle()

  if (!subconta) {
    throw new Error('Subconta não encontrada ou sem acesso.')
  }
  if (subconta.tipo !== 'cliente') {
    throw new Error('Apenas subcontas de cliente podem ser movidas entre gestores.')
  }

  const { data: novoGestor } = await supabase
    .from('profiles')
    .select('id, tipo_perfil')
    .eq('id', dados.novoGestorId)
    .maybeSingle()

  if (!novoGestor) {
    throw new Error('Novo gestor não encontrado.')
  }
  if (novoGestor.tipo_perfil !== 'educador' && novoGestor.tipo_perfil !== 'master') {
    throw new Error('O novo gestor deve ser um educador ou master.')
  }

  const { error } = await supabase
    .from('subcontas')
    .update({ gestor_id: dados.novoGestorId })
    .eq('id', dados.subcontaId)

  if (error) {
    throw new Error(`Erro ao mover cliente: ${error.message}`)
  }

  revalidatePath('/painel')
  return { ok: true as const }
}

const excluirClienteSchema = z.object({
  subcontaId: z.string().uuid(),
  modo: z.enum(['temporario', 'permanente']),
})

/**
 * Exclui uma subconta de **cliente** (Spec 21 · RF-5.2) em duas modalidades:
 *
 * - **`temporario` (soft-delete):** marca `deleted_at = now()` (some das
 *   listagens) e **bane o login na hora** — o cliente para de entrar
 *   imediatamente, mas é recuperável por 90 dias via {@link restaurarCliente}.
 * - **`permanente` (hard-delete):** roda a purga completa agora
 *   ({@link purgarSubcontaCliente}: desvincula anamnese → apaga a subconta e os
 *   dados-filhos → remove o login). Sem volta.
 *
 * Permissão: educador exclui **só os seus** clientes; master, qualquer cliente.
 * **Nunca** uma `pessoal` (RF-5.4). A RLS (DELETE: `tipo='cliente' AND
 * (gestor_id=auth.uid() OR is_master())`) é a barreira real; a checagem
 * explícita abaixo é defesa em profundidade.
 */
export async function excluirCliente(
  subcontaId: string,
  modo: 'temporario' | 'permanente'
) {
  const dados = excluirClienteSchema.parse({ subcontaId, modo })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  const { data: sub } = await supabase
    .from('subcontas')
    .select('id, tipo, gestor_id, owner_user_id')
    .eq('id', dados.subcontaId)
    .maybeSingle()
  if (!sub) throw new Error('Subconta não encontrada ou sem acesso.')
  if (sub.tipo !== 'cliente') {
    throw new Error('Apenas contas de cliente podem ser excluídas.')
  }
  const isMaster = gestor.tipo_perfil === 'master'
  if (!isMaster && sub.gestor_id !== gestor.id) {
    throw new Error('Sem permissão para excluir este cliente.')
  }

  const admin = createSupabaseAdminClient()

  if (dados.modo === 'permanente') {
    await purgarSubcontaCliente(admin, supabase, sub.id, sub.owner_user_id)
    revalidatePath('/painel')
    return { ok: true as const }
  }

  // temporario: soft-delete + suspender o login na hora.
  const { error } = await supabase
    .from('subcontas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', sub.id)
  if (error) throw new Error(`Erro ao excluir cliente: ${error.message}`)

  if (sub.owner_user_id) {
    const { error: erroBan } = await admin.auth.admin.updateUserById(
      sub.owner_user_id,
      { ban_duration: BAN_DURACAO }
    )
    if (erroBan) {
      throw new Error(`Cliente movido para a lixeira, mas falhou ao suspender o login: ${erroBan.message}`)
    }
  }

  revalidatePath('/painel')
  return { ok: true as const }
}

const restaurarClienteSchema = z.object({
  subcontaId: z.string().uuid(),
})

/**
 * Restaura um cliente da lixeira (Spec 21 · RF-5c.3): limpa `deleted_at` e
 * **reativa o login** (remove o ban). Só funciona dentro da janela de 90 dias —
 * depois disso a Edge Function `purgar-lixeira` já terá apagado tudo.
 *
 * Permissão idêntica à exclusão: gestor dono ou master. A RLS de UPDATE
 * (`gestor_id=auth.uid() OR is_master()`) autoriza mesmo com `deleted_at` setado.
 */
export async function restaurarCliente(subcontaId: string) {
  const dados = restaurarClienteSchema.parse({ subcontaId })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  const { data: sub } = await supabase
    .from('subcontas')
    .select('id, tipo, gestor_id, owner_user_id, deleted_at')
    .eq('id', dados.subcontaId)
    .maybeSingle()
  if (!sub) throw new Error('Subconta não encontrada ou sem acesso.')
  if (sub.tipo !== 'cliente') {
    throw new Error('Apenas contas de cliente podem ser restauradas.')
  }
  const isMaster = gestor.tipo_perfil === 'master'
  if (!isMaster && sub.gestor_id !== gestor.id) {
    throw new Error('Sem permissão para restaurar este cliente.')
  }

  const { error } = await supabase
    .from('subcontas')
    .update({ deleted_at: null })
    .eq('id', sub.id)
  if (error) throw new Error(`Erro ao restaurar cliente: ${error.message}`)

  if (sub.owner_user_id) {
    const admin = createSupabaseAdminClient()
    const { error: erroUnban } = await admin.auth.admin.updateUserById(
      sub.owner_user_id,
      { ban_duration: 'none' }
    )
    if (erroUnban) {
      throw new Error(`Cliente restaurado, mas falhou ao reativar o login: ${erroUnban.message}`)
    }
  }

  revalidatePath('/painel')
  return { ok: true as const }
}

const assumirClienteSchema = z.object({
  subcontaId: z.string().uuid(),
  novoGestorId: z.string().uuid(),
})

/**
 * Assume um cliente do **pool de não atribuídos** (Spec 21 · RF-5a.3) — só
 * master (decisão D1: órfãos são responsabilidade do master). É açúcar para
 * "mover um órfão": atualiza `gestor_id` para o destino escolhido (o próprio
 * master ou outro educador). Reaproveita a validação de {@link moverCliente}.
 */
export async function assumirCliente(subcontaId: string, novoGestorId: string) {
  assumirClienteSchema.parse({ subcontaId, novoGestorId })
  return moverCliente(subcontaId, novoGestorId)
}
