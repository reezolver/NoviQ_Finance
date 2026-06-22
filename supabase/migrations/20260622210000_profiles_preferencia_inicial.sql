-- Spec 17 · §8.2 — Preferência de uso do educador no 1º acesso (onboarding por
-- intenção). É só preferência + roteamento, não altera tipo_perfil.
-- NULL = onboarding ainda não feito.
alter table public.profiles
  add column preferencia_inicial text
  check (preferencia_inicial in ('pessoal', 'gestor'));
