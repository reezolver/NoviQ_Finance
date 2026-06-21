'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { assertGestor, assertMaster } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import type { Database } from '@/types/database'

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

  revalidatePath('/painel-clientes')
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

  revalidatePath('/painel-clientes')
  return { userId: criado.user.id, email: dados.email }
}

/**
 * Move um cliente entre gestores — **só master**.
 *
 * Stub: a implementação completa (validar que `novoGestorId` é educador,
 * UI de gestão, revalidação dos painéis) entra no **Spec 07**. Aqui apenas
 * fixamos a superfície e a checagem de papel.
 */
export async function moverCliente(subcontaId: string, novoGestorId: string) {
  z.object({
    subcontaId: z.string().uuid(),
    novoGestorId: z.string().uuid(),
  }).parse({ subcontaId, novoGestorId })
  await assertMaster()
  throw new Error('moverCliente: implementação completa no Spec 07.')
}
