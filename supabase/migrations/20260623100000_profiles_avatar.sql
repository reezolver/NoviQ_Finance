-- Spec 22 — Foto de perfil (avatar) do usuário.
-- Aplicada via MCP apply_migration em 2026-06-23 (ref hoddvzwacsekgenookxp).

-- (a) Coluna avatar_url em profiles. URL pública do arquivo no bucket avatars.
alter table public.profiles add column avatar_url text;

-- (b) Bucket público de avatars (PRD §8 · D4 — avatar não é dado sensível, então
-- o bucket é público: leitura aberta simplifica exibir a foto sem URLs assinadas).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- (c) Policies de Storage: escrita só do dono no seu prefixo.
-- Convenção de caminho: avatars/{auth.uid()}/arquivo.ext — o 1º segmento do
-- path tem que ser o uid de quem escreve.
--
-- LEITURA: o bucket é público, então os objetos são servidos direto pela URL
-- pública (`/storage/v1/object/public/avatars/...`) SEM precisar de policy de
-- SELECT em storage.objects. Uma policy de SELECT ampla só habilitaria LISTAR
-- o bucket inteiro (advisor `public_bucket_allows_listing`) — por isso não a
-- criamos.
create policy "avatars_owner_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
