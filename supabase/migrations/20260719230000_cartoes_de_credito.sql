-- Spec 38 · RF-18/RF-19 — cartões de crédito.
--
-- ⚠️ Reverte a decisão #2 do MVP ("zero cartão"), aprovada no PRD §1.2.
--
-- Campos: só o que o cliente pediu (nome, fechamento, vencimento).

create table if not exists public.cartoes (
  id uuid primary key default gen_random_uuid(),
  subconta_id uuid not null references public.subcontas(id) on delete cascade,
  nome text not null check (length(trim(nome)) between 1 and 60),
  dia_fechamento int not null check (dia_fechamento between 1 and 31),
  dia_vencimento int not null check (dia_vencimento between 1 and 31),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.cartoes is
  'Cartoes de credito da subconta (Spec 38). O cartao e MEIO DE PAGAMENTO, nao um grupo de categoria.';

create index if not exists cartoes_subconta_idx
  on public.cartoes (subconta_id) where deleted_at is null;

-- RLS: default-deny + a mesma regra de acesso de todas as tabelas-filhas.
alter table public.cartoes enable row level security;

drop policy if exists cartoes_todos on public.cartoes;
create policy cartoes_todos on public.cartoes
  for all
  using (public.can_access_subconta(subconta_id))
  with check (public.can_access_subconta(subconta_id));

-- ── Lançamento no cartão ────────────────────────────────────────────────────
--
-- R19.4/R19.5: `data` continua sendo a data da COMPRA (competência). O mês da
-- fatura é DERIVADO e PERSISTIDO — nunca recalculado na leitura. Sem isso,
-- mudar o dia de fechamento do cartão reescreveria o histórico do cliente.

alter table public.lancamentos
  add column if not exists cartao_id uuid references public.cartoes(id) on delete set null,
  add column if not exists ano_fatura int check (ano_fatura between 2000 and 2100),
  add column if not exists mes_fatura int check (mes_fatura between 1 and 12);

comment on column public.lancamentos.ano_fatura is
  'Ano da fatura em que a compra e cobrada (Spec 38). Resolvido na gravacao e nunca recalculado (R19.4).';
comment on column public.lancamentos.mes_fatura is
  'Mes da fatura (1-12). Quando preenchido, a despesa aparece NESTE mes do Controle Mensal, nao no mes da compra.';

-- Ou tem os três (compra no cartão) ou nenhum (lançamento comum).
alter table public.lancamentos
  drop constraint if exists lancamentos_cartao_completo;
alter table public.lancamentos
  add constraint lancamentos_cartao_completo check (
    (cartao_id is null and ano_fatura is null and mes_fatura is null)
    or (cartao_id is not null and ano_fatura is not null and mes_fatura is not null)
  );

-- A tela mensal filtra por mês de fatura.
create index if not exists lancamentos_fatura_idx
  on public.lancamentos (subconta_id, ano_fatura, mes_fatura)
  where cartao_id is not null and deleted_at is null;
