-- Spec 36 · RF-13 (PRD Q2, opção A: categoria-espelho) — o objetivo alimenta o
-- Planejado.
--
-- `orcamentos.categoria_id` é NOT NULL, então não há como gravar um planejado
-- "de objetivo" direto. A opção A resolve sem tocar em `orcamentos`: cada
-- objetivo ganha uma categoria-espelho, e o planejado usa o caminho que já
-- existe (definirPlanejado + agregarPlanejadoPorMes), incluindo o modelo
-- recorrente × override por mês.
--
-- `objetivo_id` marca a categoria como espelho — é o que permite escondê-la da
-- aba Categorias e do select de lançamento (R12), para não virar categoria
-- fantasma na cara do usuário.
--
-- ON DELETE CASCADE: apagar o objetivo leva junto a categoria-espelho e, por
-- cascata de `orcamentos`, o planejado dela.

alter table public.categorias
  add column if not exists objetivo_id uuid
  references public.objetivos(id) on delete cascade;

comment on column public.categorias.objetivo_id is
  'Quando preenchido, esta categoria e um espelho do objetivo (Spec 36). Nao aparece na aba Categorias nem no select de lancamento.';

-- Um objetivo tem no máximo uma categoria-espelho por subconta.
create unique index if not exists categorias_objetivo_espelho_unico
  on public.categorias (subconta_id, objetivo_id)
  where objetivo_id is not null;

-- Consulta frequente: "esconder espelhos" filtra por objetivo_id is null.
create index if not exists categorias_objetivo_id_idx
  on public.categorias (objetivo_id)
  where objetivo_id is not null;
