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
export type TomDiferenca = "favoravel" | "parcial" | "desfavoravel" | "neutro"

/** Token de cor de um tom. Neutro = sem alarme. */
export function corTom(tom: TomDiferenca): string {
  if (tom === "favoravel") return "text-success"
  if (tom === "parcial") return "text-warning"
  if (tom === "desfavoravel") return "text-destructive"
  return "text-muted-foreground"
}

/**
 * Semáforo por linha (Spec 36 · RF‑14) — verde / amarelo / vermelho / neutro.
 *
 * ⚠️ **Desvio consciente da RF‑14.** A spec pede *vermelho* quando não há nada
 * lançado. Isso foi revertido pelo cliente em 2026‑07‑19: mês recém-começado
 * ficava inteiro em alarme, sem informação nenhuma. Aqui "nada lançado" é
 * **neutro** — cor só entra quando existe fato para avaliar.
 *
 * O tom vem de `descreverDiferenca`; este helper só refina o caso **parcial**
 * (começou, mas não chegou ao planejado), que a RF‑14 quer em amarelo. O token
 * `--warning` existe no `globals.css` nos dois temas — não há hex hardcoded
 * (R11).
 */
export function semaforoLinha(
  grupo: GrupoCategoria,
  planejado: number,
  realizado: number
): TomDiferenca {
  const { tom } = descreverDiferenca(grupo, planejado, realizado)
  const entrada = grupo === "renda" || grupo === "investimento"

  // Só entradas (renda/aporte) têm "parcial": recebeu/aportou algo, mas menos
  // que o planejado. Em despesa, gastar menos já é bom — não é meio-termo.
  if (entrada && planejado > 0 && realizado > 0 && realizado < planejado) {
    return "parcial"
  }
  return tom
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

  // Bater o planejado é vitória, não empate — a RF‑14 pede verde aqui
  // ("fez o aporte exatamente que foi planejado fica verdinho"). Isso refina a
  // R5 da Spec 28, que tratava diferença zero como neutra quando ainda não
  // existia o conceito de "cumpriu a meta".
  if (realizado === planejado) return { texto: "na meta", tom: "favoravel" }

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
