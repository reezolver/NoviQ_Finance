-- Spec 26 — Reserva de emergência por custo de vida essencial (manual)
--
-- A meta da reserva deixa de inflar com 6× a despesa média realizada (mistura
-- luxo com essencial) e passa a usar 6× o custo de vida essencial informado
-- manualmente. NULL = não informado → meta 0. A RLS de UPDATE de subcontas
-- (gestor_id = auth.uid() OR is_master()) já cobre a escrita.

ALTER TABLE public.subcontas
  ADD COLUMN custo_vida_essencial numeric(14,2) NULL;

COMMENT ON COLUMN public.subcontas.custo_vida_essencial IS
  'Custo de vida essencial mensal informado manualmente. Base da meta de reserva (6×). NULL = não informado (meta 0).';

ALTER TABLE public.subcontas
  ADD CONSTRAINT subcontas_custo_essencial_nao_negativo
  CHECK (custo_vida_essencial IS NULL OR custo_vida_essencial >= 0);
