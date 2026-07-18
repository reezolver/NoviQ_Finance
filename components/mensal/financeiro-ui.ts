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
