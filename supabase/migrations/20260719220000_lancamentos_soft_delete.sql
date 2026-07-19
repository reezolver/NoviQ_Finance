-- Spec 37 · RF-9 (PRD Q5: soft delete) — excluir lançamento não apaga a linha.
--
-- Coerente com o pool/lixeira já existente (Spec 21): dado financeiro excluído
-- por engano precisa ser recuperável. Um toque errado no celular não pode
-- destruir histórico.
--
-- ⚠️ Toda leitura de `lancamentos` passa a precisar de `deleted_at is null`.
-- O índice parcial abaixo mantém essas leituras rápidas.

alter table public.lancamentos
  add column if not exists deleted_at timestamptz;

comment on column public.lancamentos.deleted_at is
  'Soft delete (Spec 37). Preenchido = excluido; toda leitura filtra deleted_at is null.';

-- Índice parcial: as queries do mês só olham lançamentos vivos.
create index if not exists lancamentos_vivos_idx
  on public.lancamentos (subconta_id, data)
  where deleted_at is null;
