-- Spec 16 · §8.3 — Limites de subcontas por gestor (defesa em profundidade).
-- A RLS controla *quem* insere, não *quantos*. Este trigger BEFORE INSERT é a
-- fonte de verdade do teto: máx. 1 `pessoal` e 3 `cliente` por gestor. Os mesmos
-- valores estão na server action `criarSubconta` (UX + camada de app).

create or replace function public.check_limite_subcontas()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  qtd int;
  limite int;
begin
  limite := case when new.tipo = 'pessoal' then 1 else 3 end;
  select count(*) into qtd
    from public.subcontas
   where gestor_id = new.gestor_id and tipo = new.tipo;
  if qtd >= limite then
    raise exception 'Limite de subcontas % atingido para este gestor.', new.tipo
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_limite_subcontas on public.subcontas;
create trigger trg_limite_subcontas
  before insert on public.subcontas
  for each row execute function public.check_limite_subcontas();
