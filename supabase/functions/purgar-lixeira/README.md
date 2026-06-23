# Edge Function `purgar-lixeira` (Spec 21 · RF-5c.4 / D7)

Purga **definitiva** do que está na lixeira há mais de **90 dias** — apaga
**dados E login** (`auth.users`), passo que o pg_cron sozinho não faz.

## O que faz (ordem obrigatória da purga)
1. Subcontas `cliente` com `deleted_at < now() - 90 dias`: desvincula anamnese →
   `delete` da subconta (cascade nas tabelas-filhas) → `deleteUser` do login.
2. `profiles` com `deleted_at < now() - 90 dias` (gestores auto-excluídos —
   Spec 22): `deleteUser` do login (cascade remove o profile; os clientes caem
   no pool via `gestor_id` `ON DELETE SET NULL`).

Retorna `{ subcontas, profiles, erros[] }`.

## Segredos
- A função usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` **injetados
  automaticamente** no ambiente da função pelo Supabase. **Nada de service-role
  no repo.**

## Deploy
Via MCP `deploy_edge_function` (`verify_jwt: true`). Já deployada (projeto
`hoddvzwacsekgenookxp`).

## Agendamento (1x/dia)
Migration `agendar_purga_lixeira` cria, via `pg_cron` + `pg_net`, o job
`purgar-lixeira-diario` (`0 3 * * *`, 03:00 UTC) que faz `net.http_post` para
`/functions/v1/purgar-lixeira`. O header `Authorization` leva a chave **anon**
(pública) só para satisfazer o `verify_jwt`; a função opera com a service-role
do próprio ambiente.

## Rodar manualmente (teste)
```bash
curl -i -X POST \
  'https://hoddvzwacsekgenookxp.supabase.co/functions/v1/purgar-lixeira' \
  -H 'Authorization: Bearer <ANON_OU_SERVICE_ROLE_JWT>'
```
Para testar a purga sem esperar 90 dias, defina um `deleted_at` antigo em uma
subconta de teste:
```sql
update public.subcontas set deleted_at = now() - interval '91 days' where id = '<id-de-teste>';
```
