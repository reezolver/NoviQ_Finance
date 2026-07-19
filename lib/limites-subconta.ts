import type { Database } from "@/types/database"

/**
 * Teto de subcontas por perfil (Spec 32 · RF‑2) — **fonte única** do número.
 *
 * Antes desta spec o `3` existia em três lugares independentes: a constante da
 * server action, o trigger do banco e um `>= 3` solto no layout do workspace.
 * Divergir qualquer um deles fazia a UI dizer uma coisa e o banco outra.
 *
 * Regra (PRD Q1, opção **a** — limite por perfil):
 * - **master** → sem teto de subcontas `cliente` (é o operador do produto, não
 *   um educador do plano free);
 * - **educador** externo → 1 pessoal / 3 cliente (teto do plano free, Spec 16);
 * - subconta **pessoal** → 1 para todo mundo, inclusive master: é limite
 *   conceitual (a carteira do próprio gestor), não comercial.
 *
 * ⚠️ O trigger `trg_limite_subcontas` continua sendo a **fonte de verdade**
 * (backend-first). Isto aqui é UX + defesa em profundidade e precisa espelhar a
 * mesma regra — os dois mudam juntos.
 */

type TipoPerfil = Database["public"]["Enums"]["tipo_perfil"]
type TipoSubconta = "pessoal" | "cliente"

/** Teto de subcontas `cliente` do educador externo (plano free). */
export const LIMITE_CLIENTE_EDUCADOR = 3

/** Teto de subcontas `pessoal` — igual para todos os perfis. */
export const LIMITE_PESSOAL = 1

/**
 * Quantas subcontas do tipo o perfil pode ter. `null` = **sem teto**.
 */
export function limiteSubcontas(
  tipoPerfil: TipoPerfil | null | undefined,
  tipo: TipoSubconta
): number | null {
  if (tipo === "pessoal") return LIMITE_PESSOAL
  return tipoPerfil === "master" ? null : LIMITE_CLIENTE_EDUCADOR
}

/**
 * `true` quando o perfil já não pode criar mais subcontas daquele tipo.
 * Usado pela UI (esconder atalho de "criar conta") e pela server action.
 */
export function atingiuLimite(
  tipoPerfil: TipoPerfil | null | undefined,
  tipo: TipoSubconta,
  quantidadeAtual: number
): boolean {
  const limite = limiteSubcontas(tipoPerfil, tipo)
  return limite !== null && quantidadeAtual >= limite
}

/** Mensagem de erro com o limite vigente **daquele perfil** (R4). */
export function mensagemLimite(
  tipoPerfil: TipoPerfil | null | undefined,
  tipo: TipoSubconta
): string {
  if (tipo === "pessoal") return "Você já tem uma conta pessoal."
  const limite = limiteSubcontas(tipoPerfil, "cliente")
  return `Você atingiu o limite de ${limite} contas de cliente.`
}
