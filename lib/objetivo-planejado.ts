import {
  calcularMesesRestantes,
  calcularNecessarioMensal,
} from "@/lib/calculations"

/**
 * Propagação do objetivo para o **Planejado** (Spec 36 · RF‑13).
 *
 * O cliente: *"a partir do momento que a gente jogar o objetivo aqui, o valor
 * mensal necessário já ser jogado no planejado nos meses que ele precisa
 * poupar. Aí, se o cliente não tem potencial de poupar 1.200, ele vai vir no
 * editar planejado e alterar manualmente para 700."*
 *
 * Duas regras não-negociáveis moram aqui:
 * - **É sugestão, não amarra (R2).** O educador precisa poder sobrescrever mês
 *   a mês — é o caso de uso central que o Thiago descreveu.
 * - **Nunca sobrescrever ajuste manual (R4).** Mexer no objetivo (valor ou
 *   data) não pode apagar silenciosamente um valor que o educador já ajustou à
 *   mão. Só propagamos para meses **sem override**.
 *
 * Puro e testável: não fala com o banco. Quem persiste é a action.
 */

/** Um mês-alvo da propagação. */
export interface MesPlanejado {
  ano: number
  mes: number
  /** Valor mensal sugerido para o objetivo naquele mês. */
  valor: number
}

/** Override já existente (mês que o educador ajustou à mão). */
export interface OverrideExistente {
  ano: number
  mes: number
}

/**
 * Calcula em quais meses (e com que valor) o objetivo deve entrar no planejado.
 *
 * - Valor mensal vem de `calcularNecessarioMensal` + `calcularMesesRestantes`
 *   (R1) — ambas já existiam, nada de fórmula nova.
 * - **Só do mês corrente em diante (R6):** mês fechado não é reescrito.
 * - **Data no passado → lista vazia (R5):** `calcularMesesRestantes` devolve 0 e
 *   `calcularNecessarioMensal` devolve 0; não geramos planejado nem dividimos
 *   por zero.
 * - Meses que já têm override manual são **pulados** (R4).
 */
export function calcularPropagacaoObjetivo({
  valorAlvo,
  valorAcumulado,
  dataLimite,
  hoje = new Date(),
  overridesExistentes = [],
}: {
  valorAlvo: number
  valorAcumulado: number
  /** `YYYY-MM-DD`. */
  dataLimite: string
  hoje?: Date
  overridesExistentes?: ReadonlyArray<OverrideExistente>
}): MesPlanejado[] {
  const mesesRestantes = calcularMesesRestantes(dataLimite)
  if (mesesRestantes <= 0) return []

  const valor = calcularNecessarioMensal(valorAlvo, valorAcumulado, mesesRestantes)
  // Objetivo já atingido (ou passado do alvo) não gera planejado.
  if (valor <= 0) return []

  const jaAjustado = new Set(
    overridesExistentes.map((o) => `${o.ano}-${o.mes}`)
  )

  const meses: MesPlanejado[] = []
  for (let i = 0; i < mesesRestantes; i++) {
    // Avança i meses a partir do mês corrente (dia 1 evita virada de mês em
    // datas como 31).
    const alvo = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
    const ano = alvo.getFullYear()
    const mes = alvo.getMonth() + 1
    if (jaAjustado.has(`${ano}-${mes}`)) continue
    meses.push({ ano, mes, valor })
  }
  return meses
}

/** Nome da categoria-espelho de um objetivo, exibido no bloco e no PDF. */
export function nomeCategoriaEspelho(nomeObjetivo: string): string {
  return `Objetivo: ${nomeObjetivo}`
}
