# Spec 02 — Roteamento + route group de workspace · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `meu-projeto/specs/_contexto-base.md` (§5 Login×Subconta, §6 roteamento)
- `meu-projeto/middleware.ts` (estado atual da v1 — vai evoluir)
- `meu-projeto/prompts/spec-mvp-noviq-2026-06-20.md` §3 e §5

## 1. Pré-requisitos
- [x] **Spec 00** (existe a tabela `profiles` + `subcontas`).
- [x] **Spec 01** (helper `lib/auth.ts`, status de educador).

## 2. Objetivo
Fazer o roteamento conhecer **perfil + subconta**: middleware que protege rotas e direciona por
`tipo_perfil`/`status`, e o **route group `app/(workspace)/[subcontaId]/`** que escopa e valida o
acesso a cada subconta no servidor. Definir as duas portas de entrada: **cliente → dashboard
financeiro da própria subconta**; **gestor → dashboard de gestão**.

## 3. Tarefa

### 3.1 Atualizar `middleware.ts`
O middleware atual já: refresca sessão, protege rotas não-públicas, redireciona `status='pendente'` → `/aguardando-aprovacao`, e bloqueia cliente/educador de rotas acima do papel. **Mantenha** essa base e ajuste:
- Após login, redirecionar a **raiz autenticada** conforme papel:
  - `cliente` → `/[subcontaId]/controle-anual` da **sua** subconta (buscar a subconta onde `owner_user_id = user.id`).
  - `educador`/`master` → `/painel` (dashboard de gestão; criado no Spec 07).
- Não tente validar acesso à subconta no middleware (isso é caro e duplica RLS) — apenas direcione. A validação fina fica na page/layout do workspace (3.2).
- Mantenha `/login`, `/cadastro`, `/recuperar-senha`, `/nova-senha`, `/aguardando-aprovacao`, `/anamnese/[token]` (público — Spec 08) e `/` como públicas.

### 3.2 Route group `app/(workspace)/[subcontaId]/`
- `app/(workspace)/[subcontaId]/layout.tsx` (Server Component): recebe `params.subcontaId`, busca a subconta via `createSupabaseServerClient()`. **Se a query voltar vazia, a RLS já negou** → `notFound()` (ou redirect para `/painel`). Disponibiliza nome/tipo da subconta para o header (ex.: via contexto ou props nos children).
- Estrutura de rotas-filhas (placeholders agora, implementadas nos specs seguintes):
  - `[subcontaId]/controle-anual/page.tsx`
  - `[subcontaId]/mensal/[ano]/[mes]/page.tsx`
  - `[subcontaId]/objetivos/page.tsx`
  - `[subcontaId]/investimentos/page.tsx`
  - `[subcontaId]/renda-futura/page.tsx`
- Crie um **header de workspace** reaproveitando `components/ui` (ex.: `dropdown-menu`/`select` para o seletor de subconta — implementação completa no Spec 07; aqui basta exibir o nome da subconta + toggle de tema).

### 3.3 Reconciliar dívida da v1
- `middleware.ts` (v1) roteava `cliente → /controle-anual`, `educador → /painel-clientes`, `master → /master`. Migre esses destinos para o novo esquema (`/[subcontaId]/controle-anual` e `/painel`). Remova referências a rotas que não existirão.
- **Não** recrie do zero — evolua o arquivo existente.

## 4. Arquivos a criar / tocar
- `middleware.ts` (EDITAR)
- `app/(workspace)/[subcontaId]/layout.tsx` (NOVO)
- `app/(workspace)/[subcontaId]/controle-anual/page.tsx` (placeholder)
- `app/(workspace)/[subcontaId]/mensal/[ano]/[mes]/page.tsx` (placeholder)
- demais placeholders acima
- `app/painel/page.tsx` (placeholder do dashboard de gestão — completo no Spec 07)
- `components/workspace/WorkspaceHeader.tsx` (NOVO, mínimo)

## 5. Critérios de aceite

### Automáticos
- [x] `npm run build` passa (todas as rotas/segments compilam).
- [x] `npm run lint` passa.

### Manuais
- [ ] Cliente loga e cai em `/[subcontaId]/controle-anual` da própria subconta; trocar a URL para a subconta de **outro** cliente → `notFound`/redirect (RLS nega).
- [ ] Educador loga e cai em `/painel`; acessar `/[subcontaId]/...` de um cliente que ele gerencia funciona; de um cliente de outro educador → negado.
- [ ] Master acessa `[subcontaId]` de cliente de qualquer educador; tentar abrir uma subconta `pessoal` de educador → negado.
- [ ] Educador `pendente` é mandado para `/aguardando-aprovacao`.
- [ ] Header de workspace mostra o nome da subconta e funciona em **dark + light**.

## 6. Fora de escopo
- Seletor de subconta completo + lista de clientes (Spec 07). Conteúdo real das telas (Specs 03+). Login/cadastro UI (reusar v1).
