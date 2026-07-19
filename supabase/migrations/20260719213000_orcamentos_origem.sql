-- Spec 36 · R4 — distinguir planejado escrito pela PROPAGAÇÃO do objetivo do
-- planejado digitado à MÃO pelo educador.
--
-- Sem isso as duas linhas são indistinguíveis (mesma tabela, mesmas colunas), e
-- repropagar um objetivo apagaria silenciosamente o ajuste manual — o caso que
-- o Thiago descreveu ("o cliente não consegue poupar 1.200, coloco 700").
--
-- `manual` é o default porque todo orçamento que já existe hoje foi digitado
-- por alguém. Só a propagação grava `objetivo`, e só ela pode sobrescrever
-- linhas `objetivo`.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'origem_orcamento') then
    create type public.origem_orcamento as enum ('manual', 'objetivo');
  end if;
end $$;

alter table public.orcamentos
  add column if not exists origem public.origem_orcamento not null default 'manual';

comment on column public.orcamentos.origem is
  'manual = digitado pelo educador (nunca sobrescrito pela propagacao); objetivo = gerado pela propagacao do objetivo (Spec 36).';

-- Repropagação varre por origem dentro da subconta.
create index if not exists orcamentos_origem_idx
  on public.orcamentos (subconta_id, origem);
