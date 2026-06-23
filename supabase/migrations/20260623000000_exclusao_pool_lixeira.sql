-- Spec 21 — Excluir cliente + pool de não atribuídos + lixeira 90 dias.
-- Aplicada via MCP apply_migration em 2026-06-23 (ref hoddvzwacsekgenookxp).

-- (a) Pool de não atribuídos: gestor_id nullable + FK ON DELETE SET NULL.
-- Quando o login (auth.users) de um gestor é removido, seus clientes viram
-- gestor_id null ("não atribuídos") em vez de quebrar a FK. A FK aponta para
-- auth.users(id) (confirmado via MCP antes de recriar).
alter table public.subcontas alter column gestor_id drop not null;
alter table public.subcontas drop constraint subcontas_gestor_id_fkey;
alter table public.subcontas
  add constraint subcontas_gestor_id_fkey
  foreign key (gestor_id) references auth.users(id) on delete set null;

-- (b) Lixeira (soft-delete). null = ativo; timestamp = na lixeira desde então.
alter table public.subcontas add column deleted_at timestamptz;
alter table public.profiles  add column deleted_at timestamptz;

-- (c) Policy de DELETE em subcontas (não existia nenhuma). Só clientes; o
-- gestor dono ou o master. A purga permanente passa por aqui via client de
-- usuário (RLS), sem service-role para a subconta.
create policy "subcontas: delete cliente"
  on public.subcontas for delete to authenticated
  using (tipo = 'cliente' and (gestor_id = auth.uid() or public.is_master()));

-- (d) Índices para as varreduras de lixeira e do pool.
create index if not exists idx_subcontas_deleted_at
  on public.subcontas(deleted_at) where deleted_at is not null;
create index if not exists idx_subcontas_gestor_null
  on public.subcontas(tipo) where gestor_id is null;
create index if not exists idx_profiles_deleted_at
  on public.profiles(deleted_at) where deleted_at is not null;
