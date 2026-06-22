# Spec 01 — Acesso: admin client, logins de cliente, aprovação de educador · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `noviq-app/specs/_contexto-base.md`
- `noviq-app/prompts/spec-mvp-noviq-2026-06-20.md` §7 (segurança) e §9 (server actions)
- `lib/supabase-server.ts` (padrão do server client)

## 1. Pré-requisitos
- [x] **Spec 00 concluído** (schema + RLS + trigger `handle_new_user` + seed master).
- [x] `SUPABASE_SERVICE_ROLE_KEY` presente em `.env.local` (já está). **Nunca** expor em `NEXT_PUBLIC_*`.

## 2. Objetivo
Habilitar a criação de identidades de login pelo backend: o **admin client** (service-role,
server-only), a Server Action que cria **login de cliente** (com `email_confirm: true`, resolvendo
o atrito de confirmação de email), o fluxo de **auto-cadastro + aprovação de educador**, e a
semeadura de **categorias default** ao criar subconta.

## 3. Tarefa

### 3.1 `lib/supabase-admin.ts` (NOVO, server-only)
```ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```
> Instale `server-only` se ainda não existir (`npm i server-only`). Esse client **bypassa RLS** — use só dentro de Server Actions/Route Handlers, nunca em client components.

### 3.2 Helper de autorização no servidor
Crie `lib/auth.ts` com `getUsuarioAtual()` (lê `createSupabaseServerClient()`, retorna `{ id, tipo_perfil, status }` a partir do JWT/`profiles`) e `assertGestor()` que lança se o usuário não for `educador` (ativo) nem `master`. Toda action privilegiada chama `assertGestor()` **primeiro**.

### 3.3 Server Action: criar subconta + semear categorias
`criarSubconta(tipo: 'pessoal'|'cliente', nome: string, ownerEmail?: string)`:
1. `assertGestor()`.
2. Insere em `subcontas` com `gestor_id = auth.uid()`. Para `tipo='pessoal'`, `owner_user_id = auth.uid()`.
3. **Semeia categorias default** (taxonomia da planilha — fonte de verdade):
   - `renda`: Salário, Investimentos (rendimento)
   - `fixa`: Aluguel, Internet, Gás, Seguro
   - `variavel`: Transporte, Alimentação, Lazer, Uber  ← **variável, não fixa**
   - `investimento`: Aporte
   (`is_default=true`, `ordem` sequencial.)
4. Para `tipo='cliente'` com `ownerEmail`, opcionalmente encadeia `criarLoginCliente` (3.4).

### 3.4 Server Action: criar login de cliente
`criarLoginCliente(subcontaId: string, email: string, senha: string)`:
1. `assertGestor()` e valida que `subconta.gestor_id = auth.uid()` (ou master).
2. `createSupabaseAdminClient().auth.admin.createUser({ email, password: senha, email_confirm: true, app_metadata: { tipo_perfil: 'cliente', status: 'ativo' } })`.
3. `update subcontas set owner_user_id = <novo id> where id = subcontaId`.
4. `revalidatePath` do painel de gestão.

### 3.5 Auto-cadastro + aprovação de educador
- **Cadastro** (`/cadastro` — pode reusar a página da v1 se existir em `_arquivo-v1`, senão criar): `supabase.auth.signUp({ email, password, options: { data: { nome } } })`. O trigger cria o profile como `cliente/pendente` por default — então o cadastro de **educador** precisa definir o papel: faça o signUp e, em seguida, uma Server Action `marcarComoEducadorPendente()` que via **admin** seta `app_metadata.tipo_perfil='educador'`, `status='pendente'` e atualiza o `profiles`. (Alternativa: edge function no signup; manter simples no MVP.)
- **Aprovação:** Server Action `aprovarEducador(userId)` — só master: `admin.updateUserById(userId, { app_metadata: { status: 'ativo' } })` + `update profiles set status='ativo'`. O educador precisa **refazer login** para o novo claim valer (trade-off aceito).
- **Roteamento** de `status='pendente'` → `/aguardando-aprovacao` é tratado no Spec 02.

## 4. Arquivos a criar / tocar
- `lib/supabase-admin.ts` (NOVO)
- `lib/auth.ts` (NOVO)
- `app/actions/subcontas.ts` (NOVO) — `criarSubconta`, `criarLoginCliente`, `moverCliente` (stub p/ Spec 07)
- `app/actions/educadores.ts` (NOVO) — `marcarComoEducadorPendente`, `aprovarEducador`
- `package.json` — dep `server-only` se faltar.

## 5. Contratos relevantes
- `app_metadata` (claims no JWT): `{ tipo_perfil: 'master'|'educador'|'cliente', status: 'ativo'|'pendente'|'inativo' }`. É o que `is_master()` e a RLS leem.
- `user_metadata`: `{ nome }`.

## 6. Critérios de aceite

### Automáticos
- [x] `npm run build` passa (✓ exit 0). `npm run lint` está limpo nos arquivos novos; os erros restantes são **pré-existentes** em `app/styleguide/**` (demos), não introduzidos por este spec. `tsc --noEmit` ✓.
- [x] `SUPABASE_SERVICE_ROLE_KEY` **não** aparece em nenhum arquivo client (`grep` por `SERVICE_ROLE` só em `lib/supabase-admin.ts`; demais ocorrências são markdown de specs).
- [x] Após seed de subconta `cliente`, `categorias` retorna **11** default com grupos corretos (renda=2, fixa=4, variavel=4, investimento=1; Transporte/Alimentação/Lazer/Uber = `variavel`). Verificado via MCP (round-trip + limpeza).

### Manuais
- [ ] Educador cria login de cliente; o cliente consegue **logar direto** (sem precisar confirmar email).
- [ ] Educador novo: cadastro → cai em "aguardando aprovação"; master aprova; após novo login o educador acessa o painel de gestão.
- [ ] Uma action privilegiada chamada por um `cliente` é **recusada** (`assertGestor` barra).

## 7. Fora de escopo
- Telas de painel/seletor (Spec 07). UI de cadastro/login polida (reusar/adaptar da v1). Conversão de anamnese (Spec 08).
