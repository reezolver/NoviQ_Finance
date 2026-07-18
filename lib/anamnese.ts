/**
 * Anamnese / ficha financeira — schema das respostas, mapeamento para a
 * taxonomia da planilha e diagnóstico (analise) calculado no servidor.
 *
 * Este módulo é **server-safe e client-safe** (sem `server-only`, sem
 * `'use server'`): o formulário público (client), o Route Handler de submissão
 * (server) e a action de conversão (server) compartilham o **mesmo** `zod`
 * schema, garantindo que a forma das `respostas` nunca diverge.
 *
 * As fórmulas do diagnóstico **reutilizam** `lib/calculations.ts` — nunca
 * recalcular percentuais/saldo inline.
 */

import { z } from 'zod'
import {
  REGRA_503020,
  calcularDistribuicao503020,
  calcularPercentual,
  calcularSaldoMes,
  type GrupoCategoria,
} from '@/lib/calculations'

// ─── Helpers de validação ──────────────────────────────────────────────────────

/** Campo monetário: número ≥ 0, vazio/ausente vira 0 (form manda string). */
const dinheiro = z.coerce.number().min(0, 'Não pode ser negativo.').default(0)

/**
 * Inteiro **opcional** de item de lista (Spec 29 §3.3 / R2).
 *
 * `z.coerce.number()` transforma `''`/`null` em `0` mas `undefined` em `NaN` —
 * e um `NaN` num único item invalidava a **ficha inteira**, com o lead vendo só
 * "Dados inválidos.". Aqui normalizamos vazio → `undefined` **antes** de coagir
 * e deixamos o campo opcional: um dependente sem idade grava normalmente.
 */
function inteiroOpcional(max: number, mensagem: string) {
  return z.preprocess(vazioParaUndefined, z.coerce.number().int().min(0, mensagem).max(max, mensagem).optional())
}

/**
 * Mesma tolerância do `inteiroOpcional`, mas com valor padrão: vazio cai no
 * `padrao` em vez de invalidar o item (Spec 29 R2).
 */
function inteiroComPadrao(min: number, max: number, padrao: number, mensagem: string) {
  return z.preprocess(
    vazioParaUndefined,
    z.coerce.number().int().min(min, mensagem).max(max, mensagem).default(padrao)
  )
}

/** Normaliza "campo em branco" (`''`, `null`, `NaN`) para `undefined`. */
function vazioParaUndefined(v: unknown): unknown {
  return v === '' || v === null || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v
}

const dependenteSchema = z.object({
  nome: z.string().trim().max(120).default(''),
  idade: inteiroOpcional(120, 'Idade deve ser entre 0 e 120.'),
})

const dividaSchema = z.object({
  tipo: z.string().trim().min(1, 'Descreva a dívida.').max(80),
  valor_total: dinheiro,
  valor_parcela: dinheiro,
  parcelas_restantes: inteiroComPadrao(0, 600, 0, 'Informe um número de parcelas válido.'),
})

const objetivoSchema = z.object({
  nome: z.string().trim().min(1, 'Descreva o objetivo.').max(120),
  valor_alvo: dinheiro,
  prazo_meses: inteiroComPadrao(1, 600, 12, 'Prazo deve ser entre 1 e 600 meses.'),
})

/**
 * Schema completo das respostas (jsonb `anamneses.respostas`). **Fonte de
 * verdade** da forma dos dados — validado no Route Handler antes de gravar.
 */
export const respostasSchema = z.object({
  pessoal: z.object({
    nome: z.string().trim().min(1, 'Informe seu nome.').max(120),
    email: z.union([z.string().trim().email('E-mail inválido.'), z.literal('')]).default(''),
    telefone: z.string().trim().max(40).default(''),
    idade: inteiroOpcional(120, 'Idade deve ser entre 0 e 120.'),
    profissao: z.string().trim().max(120).default(''),
    estado_civil: z.string().trim().max(40).default(''),
  }),
  dependentes: z.array(dependenteSchema).max(20).default([]),
  renda: z.object({
    salario: dinheiro,
    outras_rendas: dinheiro,
  }),
  despesas: z.object({
    // fixas
    aluguel: dinheiro,
    contas_casa: dinheiro,
    educacao: dinheiro,
    saude: dinheiro,
    assinaturas: dinheiro,
    outras_fixas: dinheiro,
    // variáveis
    alimentacao: dinheiro,
    transporte: dinheiro,
    lazer: dinheiro,
    vestuario: dinheiro,
    outras_variaveis: dinheiro,
  }),
  investimento: z.object({
    aporte_mensal: dinheiro,
  }),
  patrimonio: z.object({
    reserva_emergencia: dinheiro,
    investimentos: dinheiro,
    imoveis: dinheiro,
    veiculos: dinheiro,
  }),
  dividas: z.array(dividaSchema).max(30).default([]),
  objetivos: z.array(objetivoSchema).max(20).default([]),
  observacoes: z.string().trim().max(2000).default(''),
})

export type RespostasAnamnese = z.infer<typeof respostasSchema>
export type DependenteAnamnese = z.infer<typeof dependenteSchema>
export type DividaAnamnese = z.infer<typeof dividaSchema>
export type ObjetivoAnamnese = z.infer<typeof objetivoSchema>

/** Body do POST público de submissão (respostas + consentimento LGPD). */
export const submissaoSchema = z.object({
  respostas: respostasSchema,
  consentimento: z.boolean(),
})

// ─── Mapeamento campo → categoria → grupo (planilha) ────────────────────────────
//
// As perguntas financeiras caem nos MESMOS `grupos` da planilha (Spec 08 §6).
// Atenção: Alimentação/Transporte/Lazer/Vestuário nascem como `variavel`
// (não `fixa`), espelhando `CATEGORIAS_DEFAULT` em app/actions/subcontas.ts.

/** Campos da seção `renda`. */
type CampoRenda = keyof RespostasAnamnese['renda']
/** Campos da seção `despesas`. */
type CampoDespesa = keyof RespostasAnamnese['despesas']

interface MapaCategoria {
  /** Rótulo da categoria criada na subconta. */
  categoria: string
  /** Grupo da taxonomia (planilha). */
  grupo: GrupoCategoria
  /** Resolve o valor mensal a partir das respostas. */
  valor: (r: RespostasAnamnese) => number
}

/**
 * Mapa pergunta → categoria → grupo + extrator do valor mensal. Usado tanto na
 * conversão em subconta (criar `categorias` + `orcamentos`) quanto no
 * diagnóstico (totais por grupo). Única fonte do mapeamento.
 */
export const MAPA_CATEGORIAS: ReadonlyArray<MapaCategoria> = [
  // Renda
  { categoria: 'Salário', grupo: 'renda', valor: (r) => r.renda.salario },
  { categoria: 'Outras rendas', grupo: 'renda', valor: (r) => r.renda.outras_rendas },
  // Despesas fixas
  { categoria: 'Aluguel / Financiamento', grupo: 'fixa', valor: (r) => r.despesas.aluguel },
  { categoria: 'Contas da casa', grupo: 'fixa', valor: (r) => r.despesas.contas_casa },
  { categoria: 'Educação', grupo: 'fixa', valor: (r) => r.despesas.educacao },
  { categoria: 'Saúde', grupo: 'fixa', valor: (r) => r.despesas.saude },
  { categoria: 'Assinaturas', grupo: 'fixa', valor: (r) => r.despesas.assinaturas },
  { categoria: 'Outras despesas fixas', grupo: 'fixa', valor: (r) => r.despesas.outras_fixas },
  // Despesas variáveis
  { categoria: 'Alimentação', grupo: 'variavel', valor: (r) => r.despesas.alimentacao },
  { categoria: 'Transporte', grupo: 'variavel', valor: (r) => r.despesas.transporte },
  { categoria: 'Lazer', grupo: 'variavel', valor: (r) => r.despesas.lazer },
  { categoria: 'Vestuário', grupo: 'variavel', valor: (r) => r.despesas.vestuario },
  { categoria: 'Outras despesas variáveis', grupo: 'variavel', valor: (r) => r.despesas.outras_variaveis },
  // Investimento (aporte)
  { categoria: 'Aporte', grupo: 'investimento', valor: (r) => r.investimento.aporte_mensal },
]

/** Garante que toda chave de `renda`/`despesas` aparece no mapa (defesa de tipos). */
const _camposRendaCobertos: ReadonlyArray<CampoRenda> = ['salario', 'outras_rendas']
const _camposDespesaCobertos: ReadonlyArray<CampoDespesa> = [
  'aluguel', 'contas_casa', 'educacao', 'saude', 'assinaturas', 'outras_fixas',
  'alimentacao', 'transporte', 'lazer', 'vestuario', 'outras_variaveis',
]
void _camposRendaCobertos
void _camposDespesaCobertos

/** Categoria pré-preenchida resolvida das respostas (para a conversão). */
export interface CategoriaPreenchida {
  categoria: string
  grupo: GrupoCategoria
  valorMensal: number
}

/**
 * Resolve as categorias da subconta a partir das respostas — só as que têm
 * valor > 0 (não polui a carteira com categorias zeradas). O planejado mensal
 * de cada uma vai para `orcamentos` (recorrente, `mes=null`).
 */
export function categoriasDaAnamnese(r: RespostasAnamnese): CategoriaPreenchida[] {
  return MAPA_CATEGORIAS.map((m) => ({
    categoria: m.categoria,
    grupo: m.grupo,
    valorMensal: m.valor(r),
  })).filter((c) => c.valorMensal > 0)
}

// ─── Diagnóstico (analise) ──────────────────────────────────────────────────────

/** Comparativo real × ideal de um grupo na regra 50‑30‑20. */
export interface LinhaDistribuicao {
  /** Valor mensal real declarado. */
  real: number
  /** Valor ideal pela 50‑30‑20 sobre a renda. */
  ideal: number
  /** % da renda que o real representa. */
  percentual: number
}

/** Diagnóstico calculado no servidor a partir das respostas (jsonb `analise`). */
export interface AnaliseAnamnese {
  renda_total: number
  total_fixas: number
  total_variaveis: number
  total_investimento: number
  despesa_total: number
  saldo: number
  distribuicao: {
    fixo: LinhaDistribuicao
    variavel: LinhaDistribuicao
    investimento: LinhaDistribuicao
  }
  reserva: {
    /** Reserva de emergência declarada. */
    atual: number
    /** Meta = 6× despesa mensal (decisão #4). */
    meta: number
    /** % da meta já coberta. */
    percentual: number
  }
  patrimonio_total: number
  dividas_total: number
  patrimonio_liquido: number
  /** Pontos de atenção legíveis para o gestor. */
  alertas: string[]
  /** Carimbo do cálculo. */
  calculado_em: string
}

/** Meses de despesa que compõem a reserva de emergência (decisão #4). */
const MESES_RESERVA = 6

/**
 * Calcula o diagnóstico financeiro da anamnese. Reaproveita as fórmulas de
 * `lib/calculations.ts` (50‑30‑20, percentual, saldo mensal). Saída pura →
 * gravada em `anamneses.analise`.
 */
export function calcularAnaliseAnamnese(r: RespostasAnamnese): AnaliseAnamnese {
  const renda_total = r.renda.salario + r.renda.outras_rendas

  const total_fixas =
    r.despesas.aluguel +
    r.despesas.contas_casa +
    r.despesas.educacao +
    r.despesas.saude +
    r.despesas.assinaturas +
    r.despesas.outras_fixas
  const total_variaveis =
    r.despesas.alimentacao +
    r.despesas.transporte +
    r.despesas.lazer +
    r.despesas.vestuario +
    r.despesas.outras_variaveis
  const total_investimento = r.investimento.aporte_mensal

  const despesa_total = total_fixas + total_variaveis
  const saldo = calcularSaldoMes({
    renda: renda_total,
    fixas: total_fixas,
    variaveis: total_variaveis,
    investimento: total_investimento,
  })

  const ideal = calcularDistribuicao503020(renda_total)
  const distribuicao = {
    fixo: {
      real: total_fixas,
      ideal: ideal.fixo,
      percentual: calcularPercentual(total_fixas, renda_total),
    },
    variavel: {
      real: total_variaveis,
      ideal: ideal.variavel,
      percentual: calcularPercentual(total_variaveis, renda_total),
    },
    investimento: {
      real: total_investimento,
      ideal: ideal.investimento,
      percentual: calcularPercentual(total_investimento, renda_total),
    },
  }

  const reservaMeta = despesa_total * MESES_RESERVA
  const reserva = {
    atual: r.patrimonio.reserva_emergencia,
    meta: reservaMeta,
    percentual:
      reservaMeta > 0 ? calcularPercentual(r.patrimonio.reserva_emergencia, reservaMeta) : 0,
  }

  const patrimonio_total =
    r.patrimonio.reserva_emergencia +
    r.patrimonio.investimentos +
    r.patrimonio.imoveis +
    r.patrimonio.veiculos
  const dividas_total = r.dividas.reduce((soma, d) => soma + d.valor_total, 0)
  const patrimonio_liquido = patrimonio_total - dividas_total

  const alertas: string[] = []
  if (saldo < 0) {
    alertas.push('Saldo mensal negativo: as despesas superam a renda.')
  }
  if (renda_total > 0 && distribuicao.fixo.percentual > REGRA_503020.fixa * 100) {
    alertas.push('Despesas fixas acima de 50% da renda.')
  }
  if (renda_total > 0 && distribuicao.investimento.percentual < REGRA_503020.investimento * 100) {
    alertas.push('Investe menos de 20% da renda.')
  }
  if (reserva.atual < reservaMeta) {
    alertas.push('Reserva de emergência abaixo da meta de 6× as despesas mensais.')
  }
  if (dividas_total > 0) {
    alertas.push('Possui dívidas em aberto.')
  }

  return {
    renda_total,
    total_fixas,
    total_variaveis,
    total_investimento,
    despesa_total,
    saldo,
    distribuicao,
    reserva,
    patrimonio_total,
    dividas_total,
    patrimonio_liquido,
    alertas,
    calculado_em: new Date().toISOString(),
  }
}
