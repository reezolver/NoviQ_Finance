-- Spec 25 — "Saldo em conta" acumulado
--
-- Saldo de partida da conta, base do acumulado (saldo_inicial + Σ realizado até
-- o mês). Aceita negativo (conta pode começar no vermelho). A RLS de UPDATE de
-- subcontas (gestor_id = auth.uid() OR is_master()) já cobre a escrita.

ALTER TABLE public.subcontas
  ADD COLUMN saldo_inicial numeric(14,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.subcontas.saldo_inicial IS
  'Saldo de partida da conta (antes do 1º mês com lançamentos). Base do Saldo em conta acumulado.';
