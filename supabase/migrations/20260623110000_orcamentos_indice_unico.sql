-- Spec 23 — Planejado editável (orçamento)
--
-- Suporta o upsert idempotente do planejado por categoria/mês (action
-- `definirPlanejado`). O índice único em (subconta_id, categoria_id, ano, mes)
-- com NULLS NOT DISTINCT garante UMA linha recorrente (ano=null, mes=null) por
-- categoria — sem ele o Postgres trataria cada NULL como distinto e o upsert
-- duplicaria a linha recorrente.
--
-- Observações sobre o estado real do banco (validado via MCP antes de codar):
--   * A policy de escrita já existe: `orcamentos: acesso por subconta` é `ALL`
--     com `WITH CHECK can_access_subconta(subconta_id)`. Nada a adicionar.
--   * Já existem dois índices parciais únicos (orcamentos_recorrente_uniq e
--     orcamentos_override_uniq) que impedem duplicatas — por isso NÃO há etapa
--     de dedup aqui. Eles não servem como alvo do `onConflict` da action
--     (colunas/predicado diferentes), por isso criamos o índice completo abaixo.

-- created_at para auditoria (opcional, trivial).
ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS orcamentos_unico_categoria_mes
  ON public.orcamentos (subconta_id, categoria_id, ano, mes) NULLS NOT DISTINCT;
