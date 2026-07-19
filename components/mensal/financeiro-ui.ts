import { formatarMoeda, type GrupoCategoria } from "@/lib/calculations"

/**
 * Helpers de UI da **Diferença** (cor + sinal textual). Cor/sinal não são
 * cálculo financeiro (esses vivem em `lib/calculations.ts`); aqui só traduzimos
 * um número já calculado em token de cor e prefixo.
 *
 * **Convenção única (Spec 28):** o número já chega assinado pela
 * favorabilidade — positivo = bom para o usuário, em qualquer grupo. A inversão
 * por grupo acontece uma única vez em `lib/extrato.ts` (`diferencaFavoravel`),
 * nunca aqui. Por isso estes helpers **não conhecem grupo**: se alguma chamada
 * precisar do grupo para decidir a cor, a refatoração está errada.
 */

/**
 * Token de cor de uma Diferença/saldo já assinado pela favorabilidade:
 * positivo → `text-success`, negativo → `text-destructive`, zero → neutro.
 *
 * Função **única** de cor para o conceito. Antes existia uma segunda função de
 * cor do saldo, duplicada na tela mensal e assumindo a convenção oposta — era a
 * origem do bug de "+ exibido em vermelho".
 */
export function corDiferenca(diferenca: number): string {
  if (diferenca > 0) return "text-success"
  if (diferenca < 0) return "text-destructive"
  return "text-muted-foreground"
}

/**
 * Prefixo "+" só para positivos (o negativo já vem com sinal de
 * `formatarMoeda`). Mantém o significado legível sem depender da cor
 * (acessibilidade).
 */
export function sinal(valor: number): string {
  return valor > 0 ? "+" : ""
}

/** Tom da linha: define a cor **e** já traduz a favorabilidade. */
export type TomDiferenca = "favoravel" | "desfavoravel" | "neutro"

/** Token de cor de um tom. Neutro = sem alarme. */
export function corTom(tom: TomDiferenca): string {
  if (tom === "favoravel") return "text-success"
  if (tom === "desfavoravel") return "text-destructive"
  return "text-muted-foreground"
}

/**
 * Traduz Planejado × Realizado numa frase curta que diz **o que o número
 * significa**, em vez de só mostrar um valor com sinal.
 *
 * Motivo (feedback do cliente, 2026-07-19): a coluna "Diferença" usava o mesmo
 * rótulo para coisas opostas — na Renda, `−100` quer dizer "faltam R$ 100 pra
 * bater a meta"; na Despesa, `+110` quer dizer "ainda tem R$ 110 de folga".
 * Só o sinal não comunicava isso, e o mês recém-começado (tudo com realizado
 * zero) pintava a Renda inteira de vermelho e as Despesas de verde, dando a
 * impressão de que gastar é bom e receber é ruim.
 *
 * **Nada lançado ainda → tom neutro.** Não há o que julgar antes do primeiro
 * lançamento; cor só entra quando existe fato para avaliar.
 *
 * ℹ️ Isto **não** viola a R2 da Spec 28. Lá a regra é que a **cor** não pode
 * depender do grupo — e não depende: ela vem do tom, que sai da comparação já
 * assinada. O grupo entra apenas para escolher a **palavra** ("faltam" numa
 * renda, "sobra" numa despesa), que é informação de texto, não de cor.
 */
export function descreverDiferenca(
  grupo: GrupoCategoria,
  planejado: number,
  realizado: number
): { texto: string; tom: TomDiferenca } {
  const entrada = grupo === "renda" || grupo === "investimento"
  const fmt = (v: number) => formatarMoeda(Math.abs(v))

  // Nada planejado: não há referência para comparar.
  if (planejado === 0) {
    if (realizado === 0) return { texto: "—", tom: "neutro" }
    return entrada
      ? { texto: `${fmt(realizado)} extra`, tom: "favoravel" }
      : { texto: `${fmt(realizado)} não planejado`, tom: "desfavoravel" }
  }

  // Planejado existe mas o mês ainda não aconteceu → informativo, sem alarme.
  if (realizado === 0) {
    return {
      texto: entrada ? `a receber ${fmt(planejado)}` : `a gastar ${fmt(planejado)}`,
      tom: "neutro",
    }
  }

  if (realizado === planejado) return { texto: "na meta", tom: "neutro" }

  const abaixo = realizado < planejado
  const delta = fmt(realizado - planejado)

  if (entrada) {
    return abaixo
      ? { texto: `faltam ${delta}`, tom: "desfavoravel" }
      : { texto: `${delta} acima`, tom: "favoravel" }
  }
  return abaixo
    ? { texto: `sobra ${delta}`, tom: "favoravel" }
    : { texto: `estourou ${delta}`, tom: "desfavoravel" }
}
