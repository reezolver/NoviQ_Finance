import type { GrupoCategoria } from "@/lib/calculations"

/**
 * Helpers de UI **cientes do grupo** para a Diferença (Planejado − Realizado).
 * Cor/sinal não são cálculo financeiro (esses vivem em `lib/calculations.ts`);
 * aqui só traduzimos um número já calculado em token de cor e prefixo.
 */

/**
 * Token de cor da Diferença (`Planejado − Realizado`), ciente do grupo:
 * - **renda**: favorável quando o realizado supera o planejado → diferença < 0.
 * - **despesa/investimento**: favorável quando se gasta/aporta **menos** que o
 *   planejado → diferença > 0.
 *
 * Verde = favorável (`text-success`), vermelho = desfavorável
 * (`text-destructive`), neutro quando bate exatamente.
 */
export function corDiferenca(diferenca: number, grupo: GrupoCategoria): string {
  if (diferenca === 0) return "text-muted-foreground"
  const favoravel = grupo === "renda" ? diferenca < 0 : diferenca > 0
  return favoravel ? "text-success" : "text-destructive"
}

/** Prefixo "+" só para positivos (o negativo já vem com sinal de `formatarMoeda`). */
export function sinal(valor: number): string {
  return valor > 0 ? "+" : ""
}
