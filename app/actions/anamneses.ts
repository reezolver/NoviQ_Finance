'use server'

/**
 * Server Actions da **anamnese** (Spec 08).
 *
 * ── Mapeamento pergunta → categoria → grupo (planilha) ──────────────────────
 * A fonte do mapa é `MAPA_CATEGORIAS` em `lib/anamnese.ts`. Resumo:
 *
 *   PERGUNTA (respostas)          → CATEGORIA                    → GRUPO
 *   renda.salario                 → Salário                      → renda
 *   renda.outras_rendas           → Outras rendas                → renda
 *   despesas.aluguel              → Aluguel / Financiamento       → fixa
 *   despesas.contas_casa          → Contas da casa               → fixa
 *   despesas.educacao             → Educação                     → fixa
 *   despesas.saude                → Saúde                        → fixa
 *   despesas.assinaturas          → Assinaturas                  → fixa
 *   despesas.outras_fixas         → Outras despesas fixas        → fixa
 *   despesas.alimentacao          → Alimentação                  → variavel
 *   despesas.transporte           → Transporte                   → variavel
 *   despesas.lazer                → Lazer                        → variavel
 *   despesas.vestuario            → Vestuário                    → variavel
 *   despesas.outras_variaveis     → Outras despesas variáveis    → variavel
 *   investimento.aporte_mensal    → Aporte                       → investimento
 *
 * Atenção (decisão da planilha): Alimentação/Transporte/Lazer/Vestuário são
 * `variavel`, NÃO `fixa`. Patrimônio/dívidas/objetivos viram linhas próprias
 * (`patrimonio`/`dividas`/`objetivos`), não categorias.
 */

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { assertGestor } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { criarLoginCliente } from '@/app/actions/subcontas'
import {
  categoriasDaAnamnese,
  respostasSchema,
  type RespostasAnamnese,
} from '@/lib/anamnese'
import type { Database } from '@/types/database'

type TipoPatrimonio = Database['public']['Enums']['tipo_patrimonio']
type FinalidadePatrimonio = Database['public']['Enums']['finalidade_patrimonio']

// ─── criarAnamnese ──────────────────────────────────────────────────────────────

const criarAnamneseSchema = z.object({
  nome_lead: z.string().trim().min(1, 'Informe o nome do lead.').max(120),
  email_lead: z
    .union([z.string().trim().email('E-mail inválido.'), z.literal('')])
    .optional(),
})

/** Gera um token público opaco para o link da anamnese. */
function gerarToken(): string {
  return randomBytes(24).toString('base64url')
}

/**
 * Cria uma anamnese (gestor): gera `token` único e `status='enviada'`. Roda no
 * client de usuário (RLS de `anamneses`: `gestor_id = auth.uid()`); o
 * `assertGestor()` é defesa em profundidade. Retorna o `token` para a UI montar
 * o link público.
 */
export async function criarAnamnese(nome_lead: string, email_lead?: string) {
  const dados = criarAnamneseSchema.parse({ nome_lead, email_lead })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  const token = gerarToken()
  const { data, error } = await supabase
    .from('anamneses')
    .insert({
      gestor_id: gestor.id,
      nome_lead: dados.nome_lead,
      email_lead: dados.email_lead || null,
      token,
      status: 'enviada',
    })
    .select('id, token')
    .single()

  if (error || !data) {
    throw new Error(`Erro ao criar anamnese: ${error?.message ?? 'desconhecido'}`)
  }

  revalidatePath('/painel')
  return { id: data.id, token: data.token }
}

// ─── converterAnamneseEmSubconta ────────────────────────────────────────────────

const converterSchema = z.object({
  anamneseId: z.string().uuid('Anamnese inválida.'),
  criarLogin: z.boolean().optional(),
  email: z.union([z.string().trim().email(), z.literal('')]).optional(),
  senha: z.string().min(6).optional(),
})

/** Opções da conversão de anamnese em subconta. */
export interface ConverterAnamneseOpcoes {
  /** Criar também o login do cliente (identidade própria). */
  criarLogin?: boolean
  /** E-mail do login (default: `email_lead`). */
  email?: string
  /** Senha provisória do login (obrigatória se `criarLogin`). */
  senha?: string
}

/**
 * Converte uma anamnese **preenchida** em uma subconta `cliente`
 * pré-preenchida (gestor). Cria, a partir das `respostas`:
 * - `subcontas` (`origem_anamnese_id`),
 * - `categorias` + `orcamentos` recorrentes (mapa `MAPA_CATEGORIAS`),
 * - `patrimonio`, `dividas`, `objetivos`,
 * e, opcionalmente, o login do cliente (`criarLoginCliente`).
 *
 * Tudo roda no client de usuário (RLS): a leitura da anamnese só retorna se
 * `gestor_id = auth.uid()` (master não vê — decisão #7); os inserts de subconta
 * exigem `gestor_id = auth.uid()`.
 */
export async function converterAnamneseEmSubconta(
  anamneseId: string,
  opcoes: ConverterAnamneseOpcoes = {}
) {
  const dados = converterSchema.parse({ anamneseId, ...opcoes })
  const gestor = await assertGestor()
  const supabase = await createSupabaseServerClient()

  // 1. Lê a anamnese (RLS garante posse). Precisa estar preenchida.
  const { data: anamnese, error: erroLeitura } = await supabase
    .from('anamneses')
    .select('id, nome_lead, email_lead, status, respostas, subconta_id')
    .eq('id', dados.anamneseId)
    .maybeSingle()

  if (erroLeitura || !anamnese) {
    throw new Error('Anamnese não encontrada ou sem acesso.')
  }
  if (anamnese.status !== 'preenchida') {
    throw new Error('A anamnese ainda não foi preenchida.')
  }
  if (anamnese.subconta_id) {
    throw new Error('Esta anamnese já foi convertida em subconta.')
  }

  const parsed = respostasSchema.safeParse(anamnese.respostas)
  if (!parsed.success) {
    throw new Error('Respostas da anamnese inválidas ou incompletas.')
  }
  const respostas: RespostasAnamnese = parsed.data

  // 2. Cria a subconta cliente (login criado depois, opcionalmente).
  const { data: subconta, error: erroSubconta } = await supabase
    .from('subcontas')
    .insert({
      tipo: 'cliente',
      nome: anamnese.nome_lead,
      gestor_id: gestor.id,
      owner_user_id: null,
      origem_anamnese_id: anamnese.id,
    })
    .select('id')
    .single()

  if (erroSubconta || !subconta) {
    throw new Error(`Erro ao criar subconta: ${erroSubconta?.message ?? 'desconhecido'}`)
  }
  const subcontaId = subconta.id

  // 3. Categorias (só com valor > 0) + orçamentos recorrentes (planejado inicial).
  const categoriasPreenchidas = categoriasDaAnamnese(respostas)
  if (categoriasPreenchidas.length > 0) {
    const { data: categoriasCriadas, error: erroCategorias } = await supabase
      .from('categorias')
      .insert(
        categoriasPreenchidas.map((c, indice) => ({
          subconta_id: subcontaId,
          nome: c.categoria,
          grupo: c.grupo,
          is_default: false,
          ordem: indice + 1,
        }))
      )
      .select('id, nome')

    if (erroCategorias || !categoriasCriadas) {
      throw new Error(`Erro ao criar categorias: ${erroCategorias?.message ?? 'desconhecido'}`)
    }

    const idPorNome = new Map(categoriasCriadas.map((c) => [c.nome, c.id]))
    const orcamentos = categoriasPreenchidas
      .map((c) => {
        const categoriaId = idPorNome.get(c.categoria)
        if (!categoriaId) return null
        return {
          subconta_id: subcontaId,
          categoria_id: categoriaId,
          valor_planejado: c.valorMensal,
          ano: null,
          mes: null,
        }
      })
      .filter((o): o is NonNullable<typeof o> => o !== null)

    if (orcamentos.length > 0) {
      const { error: erroOrcamentos } = await supabase.from('orcamentos').insert(orcamentos)
      if (erroOrcamentos) {
        throw new Error(`Erro ao criar orçamentos: ${erroOrcamentos.message}`)
      }
    }
  }

  // 4. Patrimônio (reserva / investimentos / imóveis / veículos com valor > 0).
  const linhasPatrimonio: Array<{
    subconta_id: string
    tipo: TipoPatrimonio
    descricao: string
    valor: number
    finalidade: FinalidadePatrimonio
  }> = []
  const p = respostas.patrimonio
  if (p.reserva_emergencia > 0) {
    linhasPatrimonio.push({
      subconta_id: subcontaId,
      tipo: 'investimento',
      descricao: 'Reserva de emergência',
      valor: p.reserva_emergencia,
      finalidade: 'reserva',
    })
  }
  if (p.investimentos > 0) {
    linhasPatrimonio.push({
      subconta_id: subcontaId,
      tipo: 'investimento',
      descricao: 'Investimentos',
      valor: p.investimentos,
      finalidade: 'patrimonio',
    })
  }
  if (p.imoveis > 0) {
    linhasPatrimonio.push({
      subconta_id: subcontaId,
      tipo: 'imovel',
      descricao: 'Imóveis',
      valor: p.imoveis,
      finalidade: 'patrimonio',
    })
  }
  if (p.veiculos > 0) {
    linhasPatrimonio.push({
      subconta_id: subcontaId,
      tipo: 'veiculo',
      descricao: 'Veículos',
      valor: p.veiculos,
      finalidade: 'patrimonio',
    })
  }
  if (linhasPatrimonio.length > 0) {
    const { error: erroPatrimonio } = await supabase.from('patrimonio').insert(linhasPatrimonio)
    if (erroPatrimonio) {
      throw new Error(`Erro ao criar patrimônio: ${erroPatrimonio.message}`)
    }
  }

  // 5. Dívidas.
  if (respostas.dividas.length > 0) {
    const { error: erroDividas } = await supabase.from('dividas').insert(
      respostas.dividas.map((d) => ({
        subconta_id: subcontaId,
        tipo: d.tipo,
        valor_total: d.valor_total,
        valor_parcela: d.valor_parcela,
        parcelas_restantes: d.parcelas_restantes,
      }))
    )
    if (erroDividas) {
      throw new Error(`Erro ao criar dívidas: ${erroDividas.message}`)
    }
  }

  // 6. Objetivos (prazo_meses → data_limite a partir de hoje).
  if (respostas.objetivos.length > 0) {
    const { error: erroObjetivos } = await supabase.from('objetivos').insert(
      respostas.objetivos.map((o) => ({
        subconta_id: subcontaId,
        nome: o.nome,
        valor_alvo: o.valor_alvo,
        data_limite: dataLimiteAPartirDeMeses(o.prazo_meses),
        valor_inicial: 0,
      }))
    )
    if (erroObjetivos) {
      throw new Error(`Erro ao criar objetivos: ${erroObjetivos.message}`)
    }
  }

  // 7. Vincula a anamnese à subconta criada.
  const { error: erroVinculo } = await supabase
    .from('anamneses')
    .update({ subconta_id: subcontaId })
    .eq('id', anamnese.id)
  if (erroVinculo) {
    throw new Error(`Subconta criada, mas falhou ao vincular a anamnese: ${erroVinculo.message}`)
  }

  // 8. Login do cliente (opcional).
  let loginCriado: { userId: string; email: string } | null = null
  if (dados.criarLogin) {
    const email = (dados.email || anamnese.email_lead || '').trim()
    if (!email) {
      throw new Error('Informe um e-mail para criar o login do cliente.')
    }
    if (!dados.senha) {
      throw new Error('Informe uma senha para criar o login do cliente.')
    }
    loginCriado = await criarLoginCliente(subcontaId, email, dados.senha)
  }

  revalidatePath('/painel')
  return { subcontaId, login: loginCriado }
}

/** Converte um prazo em meses numa data-limite `YYYY-MM-DD` a partir de hoje. */
function dataLimiteAPartirDeMeses(prazoMeses: number): string {
  const data = new Date()
  data.setMonth(data.getMonth() + prazoMeses)
  return data.toISOString().slice(0, 10)
}

// ─── descartarAnamnese ──────────────────────────────────────────────────────────

/**
 * Descarta (apaga) uma anamnese — gestor dono. RLS garante posse; bloqueia se
 * já houver subconta vinculada (a carteira não deve perder a origem).
 */
export async function descartarAnamnese(anamneseId: string) {
  const id = z.string().uuid('Anamnese inválida.').parse(anamneseId)
  await assertGestor()
  const supabase = await createSupabaseServerClient()

  const { data: anamnese } = await supabase
    .from('anamneses')
    .select('id, subconta_id')
    .eq('id', id)
    .maybeSingle()

  if (!anamnese) {
    throw new Error('Anamnese não encontrada ou sem acesso.')
  }
  if (anamnese.subconta_id) {
    throw new Error('Não é possível descartar: a anamnese já virou uma subconta.')
  }

  const { error } = await supabase.from('anamneses').delete().eq('id', id)
  if (error) {
    throw new Error(`Erro ao descartar anamnese: ${error.message}`)
  }

  revalidatePath('/painel')
  return { ok: true as const }
}
