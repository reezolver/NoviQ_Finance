-- Spec 32 · RF-2 — Limite de subcontas passa a ser função do PERFIL do gestor.
--
-- Antes: teto fixo de 3 subcontas `cliente` para todo gestor. Isso barrava o
-- master (operador do produto) de cadastrar clientes reais, aplicando nele uma
-- regra pensada para o educador externo do plano free (Spec 16).
--
-- Agora:
--   * master            -> sem teto de `cliente`
--   * educador externo  -> 3 `cliente` (teto do plano free — preservado)
--   * pessoal           -> 1 para todos (limite conceitual, não comercial)
--
-- Este trigger continua sendo a FONTE DE VERDADE do teto; a checagem em
-- `lib/limites-subconta.ts` + server action é UX e defesa em profundidade.

create or replace function public.check_limite_subcontas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  qtd int;
  limite int;
  perfil public.tipo_perfil;
begin
  -- Perfil do gestor dono da subconta. `security definer` porque a RLS de
  -- `profiles` não deixaria o gestor ler o próprio perfil em todo contexto.
  select p.tipo_perfil into perfil
    from public.profiles p
   where p.id = new.gestor_id;

  if new.tipo = 'pessoal' then
    limite := 1;
  elsif perfil = 'master' then
    limite := null; -- sem teto
  else
    limite := 3;
  end if;

  if limite is null then
    return new;
  end if;

  select count(*) into qtd
    from public.subcontas
   where gestor_id = new.gestor_id and tipo = new.tipo;

  if qtd >= limite then
    raise exception 'Limite de % subcontas do tipo % atingido para este gestor.', limite, new.tipo
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_limite_subcontas on public.subcontas;
create trigger trg_limite_subcontas
  before insert on public.subcontas
  for each row execute function public.check_limite_subcontas();

-- Sendo `security definer` no schema `public`, a função ficaria exposta como RPC
-- em /rest/v1/rpc (database linter 0028/0029). Ela só deve rodar pelo trigger.
-- O trigger continua funcionando: executa com o dono da função, não com o papel
-- do chamador.
revoke execute on function public.check_limite_subcontas() from public;
revoke execute on function public.check_limite_subcontas() from anon;
revoke execute on function public.check_limite_subcontas() from authenticated;
