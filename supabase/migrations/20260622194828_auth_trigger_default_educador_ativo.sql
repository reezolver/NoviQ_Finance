-- Spec 14 (§8.1, Opção A): novos cadastros nascem `educador/ativo` por default.
-- Antes: `cliente/pendente`. Clientes continuam corretos porque `criarLoginCliente`
-- passa `app_metadata: { tipo_perfil: 'cliente', status: 'ativo' }` explícito — o
-- coalesce respeita o valor presente. Só muda o fallback quando NÃO há app_metadata
-- (cadastro com senha / login com Google).
create or replace function public.handle_new_user()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, nome, email, tipo_perfil, status)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    new.email,
    coalesce((new.raw_app_meta_data ->> 'tipo_perfil')::tipo_perfil, 'educador'),
    coalesce((new.raw_app_meta_data ->> 'status')::status_perfil, 'ativo')
  );
  return new;
end;
$function$;
