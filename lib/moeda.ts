/**
 * Entrada de dinheiro no padrão brasileiro (Spec 34) — **fonte única** de
 * parse e de máscara.
 *
 * Antes desta spec, `parseValorBR` estava copiada em 7 componentes (lançamento,
 * planejado, objetivo, saldo inicial, patrimônio, dívida, custo essencial). As
 * cópias ainda eram idênticas, mas é exatamente o cenário que a spec queria
 * evitar: uma correção em qualquer uma delas divergiria das outras.
 *
 * `lib/calculations.ts` continua responsável por **formatar valor já calculado**
 * (`formatarMoeda`, com "R$"); aqui tratamos só o que o usuário **digita**.
 */

/** Quantos dígitos aceitamos: evita overflow visual e valores absurdos. */
const MAX_DIGITOS = 12

/**
 * Converte um valor digitado no padrão BR (vírgula decimal, ponto de milhar)
 * para `number`. Retorna `NaN` se vazio/inválido. Aceita também ponto decimal
 * e tolera `R$` e espaços (importante ao colar — Spec 34 R8).
 *
 * Comportamento **idêntico** ao das cópias que substituiu.
 */
export function parseValorBR(input: string): number {
  const limpo = input.trim().replace(/\s|R\$/g, "")
  if (!limpo) return NaN
  // Com vírgula presente, tratamos "." como separador de milhar.
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo
  return Number(normalizado)
}

/**
 * Formata um total em **centavos** no padrão BR, sem o símbolo da moeda:
 * `100050` → `"1.000,50"`. Sem "R$" porque o campo já vive num contexto
 * monetário (rótulo + placeholder `0,00`).
 */
export function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Aplica a máscara de digitação: **cada dígito entra pela direita, como
 * centavos** — o padrão dos apps financeiros brasileiros.
 *
 * `1` → `0,01` · `10` → `0,10` · `1000` → `10,00` · `100050` → `1.000,50`.
 *
 * Só olha os dígitos do que foi digitado, então colar `R$ 1.234,56` funciona
 * naturalmente (vira `123456` → `1.234,56`). Campo vazio continua **vazio**,
 * nunca `0,00` — quem decide se vazio é erro é o schema da tela (R9).
 */
export function mascararMoeda(
  digitado: string,
  { permitirNegativo = false }: { permitirNegativo?: boolean } = {}
): string {
  // O saldo inicial é o único campo que aceita valor negativo (Spec 25); nos
  // demais o "-" é simplesmente ignorado.
  const negativo = permitirNegativo && digitado.trim().startsWith("-")
  const digitos = digitado.replace(/\D/g, "").slice(0, MAX_DIGITOS)
  if (!digitos) return negativo ? "-" : ""
  return (negativo ? "-" : "") + formatarCentavos(Number(digitos))
}

/**
 * Caminho inverso: um `number` já persistido vira o texto da máscara, para
 * pré-preencher o campo em edição (`1000.5` → `"1.000,50"`). `null`/`NaN` viram
 * string vazia — campo em branco, não `0,00`.
 */
export function numeroParaMascara(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) return ""
  // `Math.round` no total em centavos evita o erro de ponto flutuante clássico
  // (1000.5 * 100 = 100049.99…).
  return formatarCentavos(Math.round(valor * 100))
}
