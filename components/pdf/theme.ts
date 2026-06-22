/**
 * Paleta e helpers compartilhados pelos PDFs (`@react-pdf/renderer`).
 *
 * Um PDF não participa do tema claro/escuro do app nem das CSS variables do
 * `globals.css` (o renderizador não as enxerga). Por isso definimos aqui uma
 * paleta fixa de documento — espelhando a identidade visual (cor primária
 * `#008CFF`, verde/vermelho de saldo) na medida do possível (Spec 11 §4).
 */

export const PDF_COLORS = {
  /** Cor primária da marca. */
  primary: "#008CFF",
  /** Texto principal. */
  text: "#0f172a",
  /** Texto secundário/rótulos. */
  muted: "#64748b",
  /** Bordas e linhas finas. */
  border: "#e2e8f0",
  /** Fundo sutil de cabeçalhos de tabela / cards. */
  surface: "#f1f5f9",
  /** Valores positivos / saldo favorável. */
  success: "#16a34a",
  /** Valores negativos / alertas. */
  destructive: "#dc2626",
  /** Branco. */
  white: "#ffffff",
} as const

/** Sinal explícito "+" só para positivos (negativo já vem com "−"). */
export function sinal(valor: number): string {
  return valor > 0 ? "+" : ""
}

/** Cor de um valor de saldo/diferença pela convenção (verde +, vermelho −). */
export function corValor(valor: number): string {
  if (valor > 0) return PDF_COLORS.success
  if (valor < 0) return PDF_COLORS.destructive
  return PDF_COLORS.muted
}
