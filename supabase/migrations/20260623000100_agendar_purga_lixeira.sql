-- Spec 21 · RF-5c.4 / D7 — Agenda a Edge Function `purgar-lixeira` 1x/dia.
-- Aplicada via MCP em 2026-06-23. Usa pg_cron + pg_net (instalado no schema
-- `extensions`, padrão Supabase — não em `public`).
--
-- O header Authorization leva a chave **anon** (pública, já exposta no client)
-- só para satisfazer o verify_jwt da função; a função opera internamente com a
-- service-role do próprio ambiente. Substitua <ANON_KEY> pela anon do projeto.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Idempotente: remove um agendamento anterior de mesmo nome antes de recriar.
select cron.unschedule('purgar-lixeira-diario')
where exists (select 1 from cron.job where jobname = 'purgar-lixeira-diario');

select cron.schedule(
  'purgar-lixeira-diario',
  '0 3 * * *', -- todo dia às 03:00 UTC
  $$
  select net.http_post(
    url := 'https://hoddvzwacsekgenookxp.supabase.co/functions/v1/purgar-lixeira',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);
