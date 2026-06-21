# Spec 00 — Fundação: schema + RLS + segurança · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `meu-projeto/CLAUDE.md`
- `meu-projeto/specs/_contexto-base.md` (conceito Login×Subconta, convenções, MCP Supabase)
- `meu-projeto/prompts/spec-mvp-noviq-2026-06-20.md` §6 (modelo de dados) e §7 (RLS) — fonte de verdade

## 1. Pré-requisitos
- Nenhum. O banco está **zerado** (`public` com 0 tabelas, 0 migrations; `auth` sem usuários). Confirme via MCP `list_tables` / `list_migrations` antes de começar.

## 2. Objetivo
Criar **todo o schema `public`** do MVP com **RLS default-deny desde a primeira tabela**, as
funções de autorização (`is_master`, `can_access_subconta`), o trigger `handle_new_user` que
popula `profiles`, e o **seed do master**. Ao final, `get_advisors(security)` deve estar limpo
e os tipos TypeScript gerados.

## 3. Tarefa (passo a passo, aplicar via MCP `apply_migration`)
Aplique em blocos (uma migration por bloco, nomes descritivos). **NÃO** rode tudo numa transação só sem checar advisors entre blocos.

### Bloco 1 — enums + `profiles` + trigger
```sql
create type tipo_perfil as enum ('master','educador','cliente');
create type status_perfil as enum ('ativo','pendente','inativo');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tipo_perfil tipo_perfil not null default 'cliente',
  status status_perfil not null default 'pendente',
  nome text,
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- popula profiles ao criar usuário em auth.users
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, email, tipo_perfil, status)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    new.email,
    coalesce((new.raw_app_meta_data ->> 'tipo_perfil')::tipo_perfil, 'cliente'),
    coalesce((new.raw_app_meta_data ->> 'status')::status_perfil, 'pendente')
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Bloco 2 — funções de autorização (papel via JWT claim, sem recursão)
```sql
create function public.is_master() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'tipo_perfil', '') = 'master'
$$;

-- depende de subcontas (criada no Bloco 3); criar esta função DEPOIS do Bloco 3
-- (mantida aqui só para referência da regra).
```

### Bloco 3 — `subcontas` + `can_access_subconta` + RLS da própria tabela
```sql
create type tipo_subconta as enum ('pessoal','cliente');

create table public.subcontas (
  id uuid primary key default gen_random_uuid(),
  tipo tipo_subconta not null,
  nome text not null,
  owner_user_id uuid references auth.users(id),       -- login dono (cliente) ou o gestor (pessoal); pode ser null
  gestor_id uuid not null references auth.users(id),   -- educador/master que gerencia
  origem_anamnese_id uuid,                             -- FK adicionada no Bloco 9 (anamneses)
  created_at timestamptz not null default now()
);
alter table public.subcontas enable row level security;

create function public.can_access_subconta(p_subconta uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subcontas s
    where s.id = p_subconta
      and ( s.owner_user_id = auth.uid()
         or s.gestor_id     = auth.uid()
         or (public.is_master() and s.tipo = 'cliente') )
  )
$$;

create policy "subcontas: select" on public.subcontas for select
  using ( owner_user_id = auth.uid() or gestor_id = auth.uid()
          or (public.is_master() and tipo = 'cliente') );
create policy "subcontas: insert" on public.subcontas for insert
  with check ( gestor_id = auth.uid() or public.is_master() );
create policy "subcontas: update" on public.subcontas for update
  using ( gestor_id = auth.uid() or public.is_master() )
  with check ( gestor_id = auth.uid() or public.is_master() );
```

### Bloco 4 — RLS de `profiles`
```sql
create policy "profiles: self select" on public.profiles for select
  using ( id = auth.uid() or public.is_master() );
create policy "profiles: self update" on public.profiles for update
  using ( id = auth.uid() ) with check ( id = auth.uid() );
-- master pode atualizar status (aprovar educador) — ver Spec 01
create policy "profiles: master update" on public.profiles for update
  using ( public.is_master() ) with check ( public.is_master() );
```

### Bloco 5 — `categorias`
```sql
create type grupo_categoria as enum ('renda','fixa','variavel','investimento');

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  subconta_id uuid not null references public.subcontas(id) on delete cascade,
  nome text not null,
  grupo grupo_categoria not null,
  is_default boolean not null default false,
  ordem int not null default 0
);
alter table public.categorias enable row level security;
create policy "categorias: acesso por subconta" on public.categorias for all
  using ( public.can_access_subconta(subconta_id) )
  with check ( public.can_access_subconta(subconta_id) );
```

### Bloco 6 — `objetivos` + `lancamentos`
```sql
create table public.objetivos (
  id uuid primary key default gen_random_uuid(),
  subconta_id uuid not null references public.subcontas(id) on delete cascade,
  nome text not null,
  valor_alvo numeric(14,2) not null,
  data_limite date not null,
  valor_inicial numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
alter table public.objetivos enable row level security;
create policy "objetivos: acesso por subconta" on public.objetivos for all
  using ( public.can_access_subconta(subconta_id) )
  with check ( public.can_access_subconta(subconta_id) );

create type tipo_lancamento as enum ('despesa','receita','objetivo');

create table public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  subconta_id uuid not null references public.subcontas(id) on delete cascade,
  data date not null default current_date,
  valor numeric(14,2) not null,
  tipo tipo_lancamento not null,
  categoria_id uuid references public.categorias(id),
  objetivo_id uuid references public.objetivos(id),
  descricao text,
  observacao text,
  created_by_user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.lancamentos enable row level security;
create policy "lancamentos: acesso por subconta" on public.lancamentos for all
  using ( public.can_access_subconta(subconta_id) )
  with check ( public.can_access_subconta(subconta_id) );
create index on public.lancamentos (subconta_id, data);
```

### Bloco 7 — `orcamentos` (Planejado, modo simples)
```sql
create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  subconta_id uuid not null references public.subcontas(id) on delete cascade,
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  valor_planejado numeric(14,2) not null,
  ano int,   -- null = recorrente (vale todo mês); preenchido = override pontual
  mes int    -- null = recorrente
);
alter table public.orcamentos enable row level security;
create policy "orcamentos: acesso por subconta" on public.orcamentos for all
  using ( public.can_access_subconta(subconta_id) )
  with check ( public.can_access_subconta(subconta_id) );
-- 1 valor recorrente por categoria + no máx 1 override por (categoria,ano,mes)
create unique index orcamentos_recorrente_uniq on public.orcamentos (categoria_id)
  where ano is null and mes is null;
create unique index orcamentos_override_uniq on public.orcamentos (categoria_id, ano, mes)
  where ano is not null;
```

### Bloco 8 — `patrimonio` + `dividas`
```sql
create type tipo_patrimonio as enum ('imovel','veiculo','investimento');
create type categoria_investimento as enum ('renda_fixa','renda_variavel','multimercado');
create type finalidade_patrimonio as enum ('reserva','patrimonio');

create table public.patrimonio (
  id uuid primary key default gen_random_uuid(),
  subconta_id uuid not null references public.subcontas(id) on delete cascade,
  tipo tipo_patrimonio not null,
  descricao text,
  valor numeric(14,2) not null default 0,
  rentabilidade numeric(14,2) not null default 0,
  categoria_investimento categoria_investimento,
  finalidade finalidade_patrimonio
);
alter table public.patrimonio enable row level security;
create policy "patrimonio: acesso por subconta" on public.patrimonio for all
  using ( public.can_access_subconta(subconta_id) )
  with check ( public.can_access_subconta(subconta_id) );

create table public.dividas (
  id uuid primary key default gen_random_uuid(),
  subconta_id uuid not null references public.subcontas(id) on delete cascade,
  tipo text not null,
  valor_parcela numeric(14,2) not null default 0,
  parcelas_restantes int not null default 0,
  taxa numeric not null default 0,
  valor_total numeric(14,2) not null default 0,
  score_faixa text
);
alter table public.dividas enable row level security;
create policy "dividas: acesso por subconta" on public.dividas for all
  using ( public.can_access_subconta(subconta_id) )
  with check ( public.can_access_subconta(subconta_id) );
```

### Bloco 9 — `anamneses` (só do gestor) + FK de origem em subcontas
```sql
create type status_anamnese as enum ('enviada','preenchida');

create table public.anamneses (
  id uuid primary key default gen_random_uuid(),
  gestor_id uuid not null references auth.users(id),
  nome_lead text not null,
  email_lead text,
  status status_anamnese not null default 'enviada',
  respostas jsonb not null default '{}'::jsonb,
  analise jsonb,
  token text not null unique,
  subconta_id uuid references public.subcontas(id),
  consentimento_at timestamptz,
  created_at timestamptz not null default now(),
  preenchida_at timestamptz
);
alter table public.anamneses enable row level security;
-- decisão #7: SÓ o gestor que enviou vê; master NÃO vê anamneses alheias
create policy "anamneses: dono" on public.anamneses for all
  using ( gestor_id = auth.uid() )
  with check ( gestor_id = auth.uid() );

alter table public.subcontas
  add constraint subcontas_origem_anamnese_fk
  foreign key (origem_anamnese_id) references public.anamneses(id);
```
> A leitura pública da anamnese (lead preenchendo via token) **não** usa RLS aberta — é feita por
> Route Handler com **service-role**, conforme Spec 08. Não crie policy de SELECT público aqui.

### Bloco 10 — seed do master
O master precisa do claim `tipo_perfil=master` no JWT. Crie via service-role (MCP/admin API),
não por `insert` direto em `auth.users`:
```
auth.admin.createUser({
  email: 'reezolver@gmail.com', password: '123456', email_confirm: true,
  user_metadata: { nome: 'Master' },
  app_metadata: { tipo_perfil: 'master', status: 'ativo' }
})
```
Depois confirme que o trigger criou o profile com `tipo_perfil='master'`, `status='ativo'`
(ajuste o profile se necessário). **Credencial provisória de DEV — anote que deve ser trocada antes de produção.**

## 4. Arquivos a criar / tocar
- Migrations aplicadas via **MCP** (`apply_migration`) — uma por bloco acima.
- `types/database.ts` (NOVO) — saída de `generate_typescript_types` (MCP). Deixe `types/financeiro.ts` por enquanto; será reconciliado nos specs de tela.

## 5. Critérios de aceite

### Automáticos
- [x] `list_tables` (MCP) mostra: `profiles, subcontas, categorias, lancamentos, orcamentos, objetivos, patrimonio, dividas, anamneses` — **todas com RLS habilitada**.
- [x] `get_advisors(security)` (MCP) **sem alertas** (nenhuma tabela sem RLS, nenhuma função com search_path mutável).
- [x] `generate_typescript_types` (MCP) gera `types/database.ts` sem erro.
- [x] `npm run build` passa.
- [x] Master existe em `auth.users` e em `profiles` com `tipo_perfil='master'`, `status='ativo'`.

### Manuais
- [ ] Logado como master (JWT com claim), um `select * from subcontas` retorna subcontas tipo `cliente` de qualquer gestor, mas **nenhuma** subconta `pessoal` de outro gestor.
- [ ] Sem login (anon), `select` em qualquer tabela retorna **vazio** (default-deny confirmado).

## 6. Fora de escopo
- Qualquer tela/UI (vem nos specs 03+). Criação de logins de educador/cliente e aprovação (Spec 01). Submissão pública de anamnese (Spec 08).
