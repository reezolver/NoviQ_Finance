-- Spec 24 — Grupo no lançamento (aporte de objetivo)
--
-- Dá ao aporte de objetivo um grupo próprio (fixa|variavel) SEM categoria
-- sintética. O grupo só existe quando NÃO há categoria; com categoria, o grupo
-- continua derivado da categoria e esta coluna fica NULL. Despesa/receita
-- normais não mudam.

ALTER TABLE public.lancamentos
  ADD COLUMN grupo public.grupo_categoria NULL;

COMMENT ON COLUMN public.lancamentos.grupo IS
  'Grupo do lançamento quando NÃO há categoria (aporte de objetivo). Só fixa|variavel. Com categoria, o grupo deriva da categoria e esta coluna fica NULL.';

-- Integridade: grupo só pode existir sem categoria, e só fixa/variavel.
ALTER TABLE public.lancamentos
  ADD CONSTRAINT lancamentos_grupo_so_sem_categoria
  CHECK (grupo IS NULL OR (categoria_id IS NULL AND grupo IN ('fixa','variavel')));
