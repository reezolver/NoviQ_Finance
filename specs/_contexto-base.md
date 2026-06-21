# Contexto base — specs Noviq Finance

> **Leia este arquivo antes de QUALQUER spec da pasta `specs/`.** Cada spec assume este
> contexto. Você (agente) começa frio: leia também `meu-projeto/CLAUDE.md` e a fonte de
> verdade `meu-projeto/prompts/spec-mvp-noviq-2026-06-20.md` (spec-mestre) +
> `meu-projeto/prompts/pesquisa-arquitetura-mvp-2026-06-20.md` (pesquisa, para o "porquê").

---

## 1. O produto (1 parágrafo)

Noviq Finance é um SaaS web de **organização financeira pessoal** que traz a clareza de uma
planilha (modelo **Planejado × Realizado × Diferença**, distribuição **50‑30‑20**) para um app
moderno. Usado pelo **cliente final** (organiza as próprias finanças, faz lançamentos) e pelo
**educador financeiro** (acompanha a carteira de clientes e lança no lugar deles quando preciso).
Princípios: **prático, simples, objetivo** — visão clara em poucas telas, baixo atrito.

## 2. Stack e comandos (fatos)

- **Next.js 16.2.6** (App Router) · **React 19.2.4** · **TypeScript estrito (sem `any`)**.
- **Shadcn/ui + Tailwind 4** · `react-hook-form` 7.76 + `zod` 4.4 · `recharts` 3.8 · `sonner` · `next-themes` · `lucide-react`.
- **Supabase** (`@supabase/ssr` 0.10.3) · deploy **Vercel** (push em `reezolver/NoviQ_Finance` → deploy automático).
- Scripts: `npm run build` (next build) · `npm run lint` (eslint). **Não há test runner.** Não use `npm run dev` como fluxo padrão de validação — o gate automático é `lint` + `build`.

## 3. Regras absolutas (de `CLAUDE.md` — não negociáveis)

- **Design system existe** em `app/styleguide/` + `components/ui/*`. **Nunca crie componente do zero** sem antes checar o styleguide; depois combine componentes Shadcn já instalados; criar algo novo só em último caso, usando as CSS variables do `globals.css`.
- **Cor primária `#008CFF`** via `bg-primary`/`text-primary`. **Nunca cores hardcoded.** Positivo = `text-success`; negativo/alerta = `text-destructive`.
- **Dark + Light obrigatórios** em tudo. Validar visualmente nos dois temas ao finalizar.
- **Backend-first:** toda decisão de acesso vive no Postgres (RLS) + Server Actions. O frontend nunca decide acesso.
- **Cálculos centralizados em `lib/calculations.ts`** — nunca cálculo inline em componente.
- **Planilha = fonte de verdade** dos cálculos e da taxonomia (modelo extraído na pesquisa).

## 4. Componentes Shadcn já instalados (`components/ui/`)

`alert · avatar · badge · button · card · chart · checkbox · dialog · dropdown-menu · form ·
input · label · popover · progress · radio-group · scroll-area · select · separator · skeleton ·
slider · sonner · switch · table · tabs · textarea · tooltip`. Também existe `components/ProgressBar.tsx`.

## 5. Conceito central: Login × Subconta

| Conceito | Onde mora | É o quê |
|---|---|---|
| **Login (identidade)** | `auth.users` + `profiles` | quem digita email/senha (master, educador, cliente) |
| **Subconta (carteira)** | `subcontas` + tabelas-filhas | um conjunto de finanças (meses, lançamentos, objetivos, patrimônio…) |

- Um login (educador/master) opera em **várias** subcontas.
- Subconta **`pessoal`** (do gestor) **não tem login próprio** → `owner_user_id = gestor_id`.
- Subconta **`cliente`** **tem login próprio** (`owner_user_id` = login do cliente; pode ser `null` até o login ser criado).
- **Regra de acesso (uma frase, vale para todo o sistema):** um login pode operar na subconta `X` se
  `X.owner_user_id = auth.uid()` **ou** `X.gestor_id = auth.uid()` **ou** `is_master() E X.tipo='cliente'`.
  → master cobre clientes de qualquer educador, **mas nunca a subconta `pessoal` de um educador** (privacidade).
- **"Trocar de perfil estilo Instagram" = selecionar a subconta ativa (contexto de workspace), NÃO trocar de sessão/token.** O gestor continua logado como ele mesmo; as queries são escopadas pela subconta da URL.

## 6. Roteamento (workspace)

- Telas de finanças vivem em **`app/(workspace)/[subcontaId]/…`**. Cada página (Server Component) e cada Server Action recebe `subcontaId` explícito e **revalida o acesso no servidor**.
- Cliente → entra direto no dashboard financeiro da própria subconta. Gestor → dashboard de gestão (lista de clientes + onboarding).

## 7. Clients Supabase

- `lib/supabase.ts` → `createClient()` (browser, client components).
- `lib/supabase-server.ts` → `createSupabaseServerClient()` (Server Components/Actions, com `cookies()`).
- `lib/supabase-admin.ts` → **a criar no Spec 01**: service-role, **server-only**, usa `SUPABASE_SERVICE_ROLE_KEY` (já está no `.env.local`, **fora** de `NEXT_PUBLIC_*`). Só para ops privilegiadas.
- **Supabase via MCP está conectado** (projeto `hoddvzwacsekgenookxp`): use as ferramentas MCP para `apply_migration`, `execute_sql`, `get_advisors`, `generate_typescript_types`, `list_tables`. **Não invente schema** — trabalhe sobre o banco real (hoje: `public` zerado, 0 tabelas, `auth` sem usuários).

## 8. Convenções de dados

- ids `uuid` (default `gen_random_uuid()`); **dinheiro `numeric(14,2)`** (nunca float); datas de lançamento `date`; timestamps `timestamptz default now()`.
- **RLS ligado em TODAS as tabelas de `public` desde a 1ª migration** (default-deny: sem policy = sem acesso). Toda tabela com `subconta_id` usa `can_access_subconta(subconta_id)`.
- Após cada bloco de migration: rodar `get_advisors(security)` (MCP) e `generate_typescript_types` (substitui/estende `types/financeiro.ts`).

## 9. Decisões de produto travadas (2026-06-20)

1. **50‑30‑20** (não 50‑30‑10). 2. **Zero cartão no MVP** (lançamento sem campo de cartão/conta).
3. **Planejamento ENTRA** (modo simples: planejado recorrente por categoria). 4. **Reserva de emergência = 6× despesas mensais** (derivada). 5. **Dependentes = lista** (na anamnese). 6. **Educador = auto-cadastro + aprovação** (`pendente` → master aprova → `ativo`). 7. **Anamnese = só do gestor que enviou** (master não vê). 8. **Subconta ativa = route segment `[subcontaId]`**.

**Fora do MVP:** "Meu Assessor" (IA no WhatsApp), venda para outros educadores, geração de contrato, lógica de fatura/ciclo de cartão, dedução automática avançada de objetivo.

## 10. Funções já existentes em `lib/calculations.ts` (reaproveitar)

`calcularDiferenca(realizado, planejado)` · `formatarMoeda(valor)` · `calcularSaldoFinal(renda, fixas, variaveis)` ⚠️ *(não separa investimento — ver Spec 04)* · `calcularProgressoObjetivo` · `calcularNecessarioMensal` · `calcularDistribuicao503020(renda)` (0.5/0.3/0.2) · `calcularPercentual` · `calcularStatusObjetivo` · `calcularMesesRestantes` · `calcularJurosCompostos` ⚠️ *(capitaliza ao mês; planilha capitaliza ao ano — ver Spec 10)*.

## 11. Como cada spec funciona

Cada arquivo `NN-*.md` é um **prompt executável de handoff**: você o cola no Claude Code (VS Code) e ele constrói aquela feature. Estrutura: leitura obrigatória → pré-requisitos → objetivo → tarefa → arquivos a tocar → contratos/dados → regras → **critérios de aceite (automáticos + manuais)** → fora de escopo. Uma feature só está "pronta" quando **todos** os critérios passam, **nos dois temas**.

Ordem de dependência: **00 → 01 → 02 → (03…11)**. As telas (03+) exigem 00–02 prontos.
