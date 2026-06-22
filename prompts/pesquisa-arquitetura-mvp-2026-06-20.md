---
date: 2026-06-20T00:00:00-03:00
researcher: Claude Code (Opus 4.8)
git_commit: 81e7f01372e9c36c67545e82c27460d58d663934
branch: main
repository: reezolver/NoviQ_Finance
topic: "Como implementar o MVP do Noviq App — arquitetura de subcontas, permissões, dados e telas sobre a fundação atual (Next.js 16 + Supabase)"
tags: [research, arquitetura, supabase, rls, multi-tenant, subcontas, anamnese, mvp]
status: complete
last_updated: 2026-06-20
last_updated_by: Claude Code (Opus 4.8)
last_updated_note: "Planilha do Thiago recebida e analisada; decisões 50-30-20 e 'zero cartão no MVP' confirmadas pelo cliente."
---

# Pesquisa: como implementar o MVP do Noviq App

**Data**: 2026-06-20 (-03:00)
**Pesquisador**: Claude Code (Opus 4.8)
**Commit**: `81e7f01` (branch `main`, working tree com 32 alterações não commitadas)
**Repositório**: https://github.com/reezolver/NoviQ_Finance

> ⚠️ **Natureza deste documento:** pesquisa **propositiva** (com recomendações) de *como* implementar o MVP — foi a opção escolhida ("Como implementar o MVP"). Difere de uma documentação "as-is" pura. As decisões finais de produto continuam com o Lucas/Thiago; as recomendações abaixo são pontos de partida fundamentados na fundação que já existe e em boas práticas de Supabase + Next.js (App Router).

---

## Pergunta de pesquisa
Pesquisar as melhores arquiteturas/abordagens para implementar o MVP do Noviq App descrito no briefing — com foco no núcleo difícil: **subcontas multi-tenant (Admin/Educador/Cliente), permissões/RLS, troca de perfil, modelo de dados, fluxo de anamnese, export PDF e LGPD** — ancorado na fundação Next.js 16 + Supabase já existente.

---

## Resumo (TL;DR)

A fundação técnica está **pronta e limpa para começar**: Next.js 16 (App Router) + `@supabase/ssr` com os 3 clients corretos (browser / server / middleware), design system 100% construído em `/app/styleguide`, e `lib/calculations.ts` com a maioria das fórmulas (Planejado/Realizado/Diferença, 50‑30‑20, juros compostos). O **banco está zerado**: schema `public` sem nenhuma tabela e **zero migrations** — ou seja, o modelo de dados será construído do zero, sem dívida técnica de schema.

O coração do MVP é separar **duas coisas que o briefing mistura na linguagem**:
1. **Identidade de login** (quem digita email/senha) → `auth.users` + `profiles`.
2. **Subconta / carteira financeira** (de quem são as finanças) → uma tabela própria (`subcontas`).

Um login (educador/master) opera em **várias** subcontas; uma subconta "pessoal" **não tem login próprio** (usa o login do gestor); uma subconta "cliente" **tem login próprio**. A recomendação central é: **a "troca de perfil estilo Instagram" NÃO é troca de sessão/token — é a seleção de uma subconta de trabalho (contexto de workspace), autorizada por RLS no backend.** Isso é mais simples e muito mais seguro do que impersonação por troca de token.

Tudo de permissão vive no Postgres (RLS, default-deny) + Server Actions/Route Handlers; o frontend nunca decide acesso. A criação de logins de cliente é feita por **ação de servidor usando a service-role key** (`auth.admin.createUser`, `email_confirm: true`), nunca no browser.

---

## Estado atual da fundação (fatos verificados)

### Frontend / app
- **Stack** (`noviq-app/package.json`): Next.js **16.2.6**, React **19.2.4**, `@supabase/ssr` **0.10.3**, `@supabase/supabase-js` **2.106.2**, Tailwind 4, Radix/shadcn, `react-hook-form` **7.76** + `zod` **4.4**, `recharts` **3.8**, `next-themes`, `sonner`.
- **Design system pronto** em `app/styleguide/` + `components/ui/*` (alert, avatar, badge, button, card, chart, checkbox, dialog, dropdown-menu, form, input, label, popover, progress, radio-group, scroll-area, select, separator, skeleton, slider, sonner, switch, table, tabs, textarea, tooltip). `CLAUDE.md` impõe: **nunca criar componente do zero sem checar o styleguide**; cor primária `#008CFF`; **dark + light obrigatórios**.
- **Clients Supabase** já no padrão correto do App Router:
  - `lib/supabase.ts` → `createBrowserClient` (client components).
  - `lib/supabase-server.ts` → `createServerClient` com `cookies()` (Server Components/Actions).
  - `middleware.ts` → `createServerClient` para refresh de sessão.
- **`lib/calculations.ts`** já tem: `calcularDiferenca` (realizado − planejado), `calcularSaldoFinal` (renda − fixas − variáveis), `calcularDistribuicao503020` (hardcoded 50/30/**20**), `calcularPercentual`, objetivos (progresso, necessário/mês, status, meses restantes), e `calcularJurosCompostos` (renda futura). **Reutilizável quase inteiro.**
- **`types/financeiro.ts`** tem `TotaisData`, `SaldosData`, `Objetivo`, `Cliente`, `Investimento` — modelo da v1, **mais simples que o novo** (ex.: `Cliente` é flat, sem o conceito de subconta).

### Backend / Supabase (verificado via MCP — projeto `hoddvzwacsekgenookxp`, `sa-east-1`, Postgres 17)
- **`public`: 0 tabelas. 0 migrations.** Clean slate total.
- **`auth`: presente e funcional, 0 usuários.** (Auth zerado em 2026-06-20.)
- **`get_advisors(security)`: sem alertas** (porque ainda não há nada em `public`).

### ⚠️ Código que ficou da v1 e precisa ser reconciliado (não é "pronto")
- `middleware.ts` consulta `profiles` (`tipo_perfil`, `status`) e roteia `cliente → /controle-anual`, `educador → /painel-clientes`, `master → /master`, `pendente → /aguardando-aprovacao`. **A tabela `profiles` não existe** (banco zerado) — hoje esse `select` retorna `null` e o roteamento por perfil é inerte. Além disso, esse roteamento **não conhece o conceito de subconta** do novo briefing. Vai precisar evoluir.
- `types/financeiro.ts` → `interface Cliente` é o modelo antigo (flat), anterior às subcontas.

---

## Modelo extraído da planilha (fonte de verdade) — `Controle Financeiro Pessoa Física.xlsx`

Analisada em 2026-06-20 (16 abas: **Controle Anual** + **12 meses** + **Investimento** + **Renda Futura** + **Objetivo**). Isto **trava a taxonomia e as fórmulas**.

### Aba de mês (modelo de `Janeiro`) — o coração
3 blocos lado a lado, cada um com **Planejado / Realizado / Diferença** (Diferença = Planejado − Realizado por linha):
- **Renda** — ex.: `Salário`, `Investimentos` (aqui = **rendimento que entra**). Total = soma.
- **Despesas Fixas** — ex.: `Aluguel`, `Internet`, `Gás`, `Seguro`, **+ uma linha especial `Investimento` (= aporte, dinheiro que SAI para investir)**. O Total das Fixas **inclui** o aporte.
- **Despesas Variáveis** — ex.: `Lazer`, `Transporte`, `Alimentação`, `Uber`. Total = soma.

**Fórmulas confirmadas (células reais):**
- **Saldo Final = Renda Total − Total Despesas Fixas − Total Despesas Variáveis** (`I3 = C12 − H20 − M21`). Como o Total das Fixas já embute o aporte, o **aporte é subtraído do saldo**. Equivale a: `Saldo = Renda − Fixa − Variável − Investimento` (com Fixa **sem** o aporte).
- **50‑30‑20 (base = Renda Total planejada):** `Fixo ideal = 0.5×Renda`, `Variável ideal = 0.3×Renda`, `Investimento ideal = 0.2×Renda` (`B323=0.5*C12, C323=0.3*C12, D323=0.2*C12`). **Confirma 50‑30‑20.**
- **Decomposição realizada p/ o 50‑30‑20:** `Fixo = soma das fixas SEM o aporte` (`SUM(H8:H18)`), `Variável = total variáveis` (`M21`), `Investimento = a linha do aporte` (`H19`). → **prova a separação**: o aporte sai do "Fixo" e vira a fatia "Investimento".

> **Implicação p/ o schema:** o campo `categorias.grupo ∈ {renda, fixa, variavel, investimento}` modela isto perfeitamente. `Saldo = Σrenda − Σfixa − Σvariavel − Σinvestimento`. O 50‑30‑20 compara cada Σ contra 50/30/20 da Σrenda. (Atenção: `lib/calculations.ts:calcularSaldoFinal` hoje **não** subtrai investimento separado — porque na planilha ele está dentro das Fixas; no modelo normalizado, separar e subtrair os 4 grupos.)

### Taxonomia confirmada (planilha vence o conflito com a anamnese)
`Transporte`, `Alimentação`, `Lazer`, `Uber` são **VARIÁVEL** na planilha (a anamnese os chamava de Fixa). **A planilha é a fonte de verdade → grupo = `variavel`.** As categorias-semente da subconta devem nascer com esses grupos.

### Controle Anual
Por mês: `Planejado = Saldo Final Planejado do mês` (`=Janeiro!I3`), `Realizado = Saldo Final Realizado` (`=Janeiro!I4`), `Diferença = Planejado − Realizado`. **O anual acompanha o SALDO mensal**; o detalhe por categoria aparece ao **abrir o mês** (consistente com o briefing: clicar no mês mostra o % de cada categoria sobre a renda).

### Objetivo
Campos: `Objetivo`, `Valor alvo`, `Data de conclusão`, `Valor acumulado`, `Progresso % (= acumulado/alvo)`, `Valor necessário mensal`. Na planilha `necessário mensal = valor_alvo / meses_restantes`; `lib/calculations.ts` usa `(alvo − acumulado)/meses` (mais correto). **Escolher uma fórmula** (recomendo a do `calculations.ts`). `meses_restantes = DATEDIF(hoje, data, "m")`. (A planilha tem `#DIV/0!`/`#NUM!` em linhas vazias — o app deve tratar graciosamente.)

### Investimento (bate 1:1 com `types/financeiro.ts`)
Tabela **Alocação dos Ativos**: `Tipo de Investimento`, `Instituição`, `Categoria` (`Renda Fixa` / `Multimercado` / `Renda Variável`), `Valor Aplicado`, `Rentabilidade`, `Finalidade` (`Reserva` / `Patrimônio`). Distribuição % por categoria (`SUMIFS`). Resumo **Reserva vs Patrimônio** (`SUMIF` por Finalidade); `Total Aplicado = Valor + Rentabilidade`.

### Renda Futura (juros compostos)
Inputs: `Aporte Inicial`, `Aporte Mensal`, `Taxa Média` (anual), `Idade Atual`, `Renda Passiva Desejada`, `Idade-alvo`. `Patrimônio Necessário = (Renda Passiva × 12) / Taxa` (perpetuidade). Projeção ano a ano: a planilha **capitaliza anualmente** (`C(n+1)=(C(n)+aporte*12)*(1+taxa)`); `lib/calculations.ts:calcularJurosCompostos` **capitaliza mensalmente** (pequena diferença de método a alinhar).

---

## Recomendações detalhadas por área

### 1. O núcleo: identidade de login × subconta (carteira)

O briefing usa "conta" para duas coisas diferentes. Separar é o que destrava tudo:

| Conceito | Tabela | É o quê |
|---|---|---|
| **Login** | `auth.users` + `profiles` | quem se autentica (master, educador, cliente) |
| **Subconta / carteira** | `subcontas` | um conjunto de finanças (meses, lançamentos, objetivos, patrimônio…) |

**Mapeamento dos casos do briefing:**
- **Subconta pessoal do gestor** (educador ou master): `tipo='pessoal'`, `owner_user_id = gestor_id =` o próprio login do gestor. **Não cria login novo.**
- **Subconta de cliente**: `tipo='cliente'`, `gestor_id =` educador/master que gerencia, `owner_user_id =` login do cliente (pode ser `null` enquanto o login ainda não foi criado — ex.: veio de anamnese).

**Regra de acesso (uma frase, vale para todo o sistema):** um login pode operar numa subconta `X` se
`X.owner_user_id = auth.uid()` (é dele) **ou** `X.gestor_id = auth.uid()` (ele gerencia) **ou** `is_master() E X.tipo='cliente'` (master cobre clientes de qualquer educador — **mas nunca a subconta `pessoal` de um educador**, garantindo a privacidade exigida).

- **Mover cliente entre educadores / puxar para o master** = `UPDATE subcontas SET gestor_id = …`. Trivial.
- **Quem lança** = a escrita é sempre na subconta; quem digitou fica registrado em `created_by_user_id` (auditoria/LGPD).

### 2. Permissões = RLS no Postgres (default-deny), não no frontend

- **RLS ligado em todas as tabelas** de `public`; sem policy = sem acesso.
- **Papel (`tipo_perfil`) como custom claim no JWT** (`auth.users.raw_app_meta_data`), lido nas policies com `auth.jwt() -> 'app_metadata' ->> 'tipo_perfil'`. Vantagem: evita consultar `profiles` dentro de policy (sem recursão, mais rápido). O papel é setado na criação do usuário (admin API) e em mudança de papel. *Trade-off:* mudar papel exige refresh de token — aceitável no MVP.
- **Acesso à subconta via função `SECURITY DEFINER`** `can_access_subconta(p_subconta uuid)` que implementa a regra da seção 1. Todas as tabelas-filhas (lançamentos, meses, objetivos, patrimônio, dívidas, categorias) referenciam essa função na policy.

Esboço ilustrativo (não é o código final):
```sql
create function public.is_master() returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'tipo_perfil', '') = 'master'
$$;

create function public.can_access_subconta(p_subconta uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from subcontas s
    where s.id = p_subconta
      and ( s.owner_user_id = auth.uid()
         or s.gestor_id     = auth.uid()
         or (public.is_master() and s.tipo = 'cliente') )
  )
$$;

-- exemplo numa tabela-filha
create policy "acesso por subconta" on lancamentos
  for all using ( can_access_subconta(subconta_id) )
  with check ( can_access_subconta(subconta_id) );
```

### 3. Troca de perfil ("estilo Instagram") = contexto de workspace, NÃO troca de sessão

Recomendação forte: **não** trocar token/sessão do Supabase para "entrar" no cliente. Em vez disso:
- O gestor continua logado como ele mesmo; a app escolhe uma **subconta ativa** e todas as queries são escopadas a ela. A RLS (via `gestor_id`/master) já autoriza ler/escrever os dados daquele cliente — não precisa impersonar.
- **Onde guardar a subconta ativa:** preferir **route segment** — `app/(workspace)/[subcontaId]/controle-anual/page.tsx` — porque cada página/Server Action recebe `subcontaId` explicitamente e o servidor revalida o acesso. (Alternativa: cookie assinado com a subconta ativa; mais "mágico", menos explícito.)
- Isso entrega a UX de "trocar de conta" (um seletor de subconta no topo) sem o risco de manipular sessões.

### 4. Criar logins de cliente + bootstrap de perfis

- **Login de cliente** é criado pelo gestor → precisa de privilégio. Fazer numa **Server Action / Route Handler com a service-role key** (`supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata, app_metadata: { tipo_perfil: 'cliente' } })`).
  - `email_confirm: true` **resolve o atrito de confirmação de email** (known issue) para contas provisionadas pelo gestor.
  - A action **valida primeiro** que `auth.uid()` é educador/master.
  - Criar um `lib/supabase-admin.ts` (service-role, **server-only**, key fora de `NEXT_PUBLIC_*`).
- **Perfil automático:** trigger `on auth.users insert → handle_new_user()` cria a linha em `profiles` lendo `raw_user_meta_data` (nome, tipo). Padrão consagrado do Supabase.
- **Seed master** (`reezolver@gmail.com` / `123456`): criar via migration/seed com `tipo_perfil='master'`, `status='ativo'`. **Credencial provisória de DEV — trocar antes de produção.**
- **Educador no MVP (DECIDIDO 2026-06-20): auto-cadastro + aprovação.** O educador se cadastra sozinho → `profiles.status='pendente'` → cai em `/aguardando-aprovacao` → o **master aprova** (`status='ativo'`). **Reaproveita o fluxo que a v1 já tinha** no `middleware.ts` (rota `/aguardando-aprovacao` + check de `status`). `tipo_perfil='educador'` definido no cadastro.

### 5. Modelo de dados proposto (schema `public`)

Tipos: dinheiro em `numeric(14,2)` (nunca float); datas de lançamento em `date`; ids `uuid`.

- **`profiles`** — `id uuid PK → auth.users(id)`, `tipo_perfil` enum(`master`,`educador`,`cliente`), `status` enum(`ativo`,`pendente`,`inativo`), `nome`, `email`, `created_at`.
- **`subcontas`** — `id`, `tipo` enum(`pessoal`,`cliente`), `nome`, `owner_user_id → auth.users` (nullable), `gestor_id → auth.users`, `origem_anamnese_id` (nullable), `created_at`. (Núcleo da seção 1.)
- **`categorias`** — `id`, `subconta_id`, `nome`, `grupo` enum(`renda`,`fixa`,`variavel`,`investimento`), `is_default`, `ordem`. **Taxonomia única por subconta** (resolve o risco de dupla classificação). Defaults semeados na criação da subconta.
- **`lancamentos`** — `id`, `subconta_id`, `data`, `valor`, `tipo` enum(`despesa`,`receita`,`objetivo`), `categoria_id`, `descricao` (opc.), `observacao` (opc.), `objetivo_id` (nullable), `created_by_user_id` (auditoria), `created_at`. **Sem campo de cartão/conta no MVP** (decisão do cliente: zero cartão — nem conexão, nem cadastro, nem rótulo). Reduz ainda mais o atrito do lançamento.
- **`orcamentos`** (o "Planejado") — **ENTRA NO MVP** (decidido 2026-06-20, modo simples). Recomendo `valor_planejado` **por categoria de forma recorrente** (um valor padrão por categoria que vale para todo mês, editável por mês quando preciso) em vez de 12 inputs/ano — mantém a coluna **Diferença** viva com baixo atrito. Estrutura: `id`, `subconta_id`, `categoria_id`, `valor_planejado`, + opcional `ano`/`mes` para overrides pontuais. O **Realizado é derivado** (soma de `lancamentos`).
- **`objetivos`** — `id`, `subconta_id`, `nome`, `valor_alvo`, `data_limite`, `valor_inicial`, `created_at`. `valor_acumulado` no MVP = simples (campo ou soma de lançamentos tipo `objetivo`); **dedução automática fica fora do MVP**.
- **`patrimonio`** — `id`, `subconta_id`, `tipo`(imóvel/veículo/investimento), `descricao`, `valor`, `categoria_investimento` (nullable: renda fixa/variável/multimercado), `finalidade` (reserva/patrimônio).
- **`dividas`** — `id`, `subconta_id`, `tipo`, `valor_parcela`, `parcelas_restantes`, `taxa`, `valor_total`, `score_faixa`.
- **`anamneses`** — `id`, `gestor_id` (dono; **visível só para o gestor**), `nome_lead`, `email_lead`, `status`(enviada/preenchida), `respostas jsonb`, `analise jsonb`, `token` (link público), `subconta_id` (nullable — set ao converter), `consentimento_at`, `created_at`, `preenchida_at`.

Todas as tabelas com `subconta_id` → policy `can_access_subconta(subconta_id)`. `anamneses` → policy `gestor_id = auth.uid()` **apenas** (decidido 2026-06-20: anamnese é **só do gestor** que enviou; o master **não** vê anamneses de outros educadores). Gerar tipos TS com `generate_typescript_types` após as migrations (substitui/estende `types/financeiro.ts`).

### 6. Regras financeiras: taxonomia única, 50‑30‑20 e desambiguações

- **Taxonomia única:** o `grupo` de `categorias` é a **única** fonte do mapeamento categoria → fixa/variável/investimento/renda. Isso elimina o conflito "Transporte/Alimentação/Lazer como Fixa na análise vs. Variável na planilha": cada categoria tem **um** grupo, definido uma vez, e anamnese ↔ controle mensal leem o mesmo lugar.
- **Fonte única de renda:** renda = `lancamentos` `tipo='receita'` (categorias `grupo='renda'`). A renda da anamnese alimenta o **Planejado/inicial**, não soma com o realizado. Evita a dupla contagem "Renda Líquida + Renda Variável = total Trabalho".
- **"Investimento" (palavra sobrecarregada) — separar 3 coisas:**
  1. **aporte (saída p/ poupar, o "20%")** → `lancamento`/`categoria` `grupo='investimento'`;
  2. **rendimento (renda que entra)** → `categoria` `grupo='renda'`;
  3. **saldo da carteira** → tabela `patrimonio` (`finalidade`).
- **50‑30‑20 (CONFIRMADO pelo cliente em 2026-06-20):** bate com a planilha (`B323=0.5*C12, C323=0.3*C12, D323=0.2*C12`) e com o `0.2` já presente em `calcularDistribuicao503020`. Manter; opcionalmente extrair os percentuais para uma constante de config.
- **Reserva de emergência** e **Patrimônio Líquido** = **derivados** (não digitados): PL = `patrimonio.valor` − `dividas.valor_total`; **meta de reserva = 6× as despesas mensais** (decidido 2026-06-20); status = reserva atual ÷ meta.

### 7. Padrões Next.js "backend-first"

- **Escritas** → Server Actions (ou Route Handlers) com `lib/supabase-server.ts`; **leituras** → Server Components com o server client. Browser client só para UI de auth e (se preciso) realtime.
- **`subcontaId` sempre validado no servidor** (a RLS é a rede de segurança final; a action também checa). Nunca confiar em id vindo do cliente sem RLS.
- **Route group de workspace**: `app/(workspace)/[subcontaId]/…` para escopar e validar acesso em cada tela (Controle Anual/Mensal, Lançamento, Objetivos, etc.).
- **`revalidatePath`/`revalidateTag`** após mutações; `useOptimistic` no lançamento para baixo atrito.
- **`lib/supabase-admin.ts`** (service-role, server-only) para ops privilegiadas (criar login de cliente, semear categorias, aceitar submissão de anamnese).

### 8. Fluxo de anamnese

- Gestor cria anamnese → gera `token` → **link público** `app/anamnese/[token]/page.tsx` (sem auth) para o lead preencher.
- **Submissão** via Route Handler que valida o `token` e grava com **service-role** — assim a tabela `anamneses` fica com RLS travada em `gestor_id` (lead nunca lê as anamneses do gestor).
- No submit, calcular a **`analise`** (diagnóstico) no servidor a partir de `respostas` + modelo da planilha; guardar em `jsonb`.
- Gestor **lista/busca/filtra por nome** (RLS `gestor_id = auth.uid()`), exporta PDF.
- **Converter em subconta**: Server Action cria `subcontas` (+ login opcional) **pré-preenchida** a partir de `respostas` (categorias, planejado inicial, patrimônio, dívidas, objetivos). Ou mantém a anamnese salva, ou descarta.
- **Consentimento LGPD** capturado no formulário (`consentimento_at`).

### 9. Export PDF

- **Opção recomendada (estruturado):** `@react-pdf/renderer` — declarativo (React → PDF), sem headless browser, amigável a serverless/Vercel. Bom para o diagnóstico em cards e para o "extrato" do mês.
- **Opção mínima (mais barata):** rota dedicada com **CSS `@media print`** + `window.print()` — zero infra; serve para um extrato simples.
- **Evitar Puppeteer/Playwright** no Vercel se possível (peso/cold start). Gráficos `recharts` em PDF exigem renderizar como imagem.

### 10. Mobile-first / baixo atrito no lançamento

- Modal de lançamento (componentes `dialog`+`form`+`tabs` já existentes): abas **Despesa/Receita/Objetivo**, campos mínimos **valor, categoria, data (hoje por padrão)**; descrição/observação opcionais e recolhidas.
- Inputs numéricos `inputMode="decimal"`; validação `zod` + `react-hook-form` (já instalados).
- Tudo validado nos **dois temas** (regra do `CLAUDE.md`).

### 11. LGPD / segurança

- **RLS default-deny** em tudo; service-role key **só no servidor**; TLS + criptografia em repouso do Supabase.
- **Auditoria** via `created_by_user_id` nos lançamentos (quem lançou em nome de quem).
- **Consentimento** na anamnese; **privacidade** do educador garantida pela regra RLS (master não vê `subcontas` `tipo='pessoal'` alheias).
- **Trocar a credencial seed do master** antes de produção.
- Rodar `get_advisors(security)` após cada bloco de migrations (vai apontar tabela sem RLS, etc.).

### 12. Reconciliação do scaffolding da v1

- **`middleware.ts`**: o roteamento por `profiles`/`tipo_perfil` precisa (a) passar a existir a tabela `profiles`, e (b) evoluir para o modelo de subcontas — gestor cai num **dashboard de gestão**, cliente cai direto no **dashboard financeiro** da própria subconta; rotas de workspace por `subcontaId`.
- **`types/financeiro.ts`**: `interface Cliente` (flat) será substituída/estendida pelos tipos gerados do schema (subconta, etc.).
- **`lib/calculations.ts`**: aproveitar; só parametrizar os percentuais 50‑30‑20.

---

## Code References (fundação atual)
- `noviq-app/middleware.ts:42-67` — roteamento por `profiles.tipo_perfil`/`status` (lógica da v1; tabela ainda inexistente).
- `noviq-app/lib/supabase.ts:5-10` — browser client (`createBrowserClient`).
- `noviq-app/lib/supabase-server.ts:4-27` — server client com `cookies()`.
- `noviq-app/lib/calculations.ts:90-96` — `calcularDistribuicao503020` com `0.2` hardcoded (ponto do 50‑30‑20 vs 10).
- `noviq-app/lib/calculations.ts:36-42` — `calcularSaldoFinal` (Saldo = Renda − Despesas).
- `noviq-app/types/financeiro.ts:59-65` — `interface Cliente` (modelo flat da v1).
- `noviq-app/CLAUDE.md` — regras absolutas de design system, Supabase via MCP, dark+light.
- `noviq-app/prompts/contexto-produto-noviq.md` — contexto de produto (versão curta, perfis, telas, fora-de-escopo).

## Documentação de arquitetura (padrões observados / propostos)
- App Router + `@supabase/ssr` com 3 clients (browser/server/middleware) — **já no padrão atual do Supabase**.
- Fórmulas financeiras **centralizadas** em `lib/calculations.ts` (regra do `CLAUDE.md`: nunca cálculo inline em componente).
- **Proposto:** RLS default-deny + papel em JWT claim + `can_access_subconta()` SECURITY DEFINER; troca de perfil como **contexto de workspace** (route segment), não troca de sessão; logins de cliente via service-role admin API.

## Decisões (todas fechadas em 2026-06-20)
1. ✅ **50‑30‑20** (não 10) — bate com a planilha.
2. ✅ **Zero cartão no MVP** — lançamento sem campo de cartão/conta.
3. ✅ **Etapa de planejamento ENTRA no MVP** — modo simples (planejado recorrente por categoria), para manter a coluna Diferença.
4. ✅ **Reserva de emergência = 6×** as despesas mensais.
5. ✅ **Dependentes = lista** (vários, cada um com idade).
6. ✅ **Educadores = auto-cadastro + aprovação** — `status='pendente'` → master aprova → `'ativo'`; reaproveita `/aguardando-aprovacao` da v1.
7. ✅ **Anamnese = só do gestor** que enviou (master não vê).
8. ✅ **Subconta ativa = route segment `[subcontaId]`** (decisão técnica; RLS valida o acesso, sem troca de sessão).

## Open Questions (precisam de material externo, fora do código)
- ✅ **RESOLVIDO (2026-06-20) — planilha recebida e analisada** (`D:\DOWNLOADS\Controle Financeiro Pessoa Física.xlsx`). Modelo, taxonomia e fórmulas extraídos na seção **"Modelo extraído da planilha"**. (A planilha em si está fora do repositório — vale guardar uma cópia/export em `noviq-app/` para versionar a fonte de verdade.)
- **Protótipo da tela de Análise/Diagnóstico** mencionado no briefing ("já existe um protótipo") — confirmar onde está (pode estar em `_arquivo-v1/`).
- **Anamnese × planilha:** as perguntas da anamnese precisam ser mapeadas para os mesmos `grupos`/categorias da planilha (ex.: o que a anamnese chama de "Transporte/Alimentação/Lazer" deve cair em `grupo='variavel'`).

## Sequência de implementação sugerida (ordem técnica)
1. Migrations do schema (`profiles` + trigger `handle_new_user`, `subcontas`, `categorias`, `lancamentos`, depois objetivos/patrimônio/dívidas/orçamentos/anamneses) com **RLS desde a primeira tabela**.
2. Seed master + `lib/supabase-admin.ts` + admin action de criar educador/cliente.
3. Atualizar `middleware.ts` + roteamento (dashboard de gestão vs financeiro) + route group `[subcontaId]`.
4. Telas do cliente na ordem do produto: Controle Anual → Mensal → Lançamento → Dashboard → Objetivos.
5. Painel de gestão (gestor/master) + troca de subconta.
6. Anamnese (link público → submissão → diagnóstico → converter em subconta).
7. Avançadas: Investimentos/Patrimônio, Renda Futura, Export PDF.

## Histórico (memória do projeto)
- Banco **zerado em 2026-06-20**; schema v1 no backup; **recomeço das telas do zero**, design system + infra mantidos.
- Estratégia **CLIENTE-FIRST** (começar pela ferramenta do cliente final). Este briefing reforça que a estrutura de **subcontas** é o núcleo do MVP.
- Decisões de arquitetura de contas registradas em memória: `project_arquitetura_contas.md`.
