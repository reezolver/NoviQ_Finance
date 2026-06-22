---
date: 2026-06-20T00:00:00-03:00
autor: Claude Code (Opus 4.8)
fonte: pesquisa-arquitetura-mvp-2026-06-20.md + contexto-produto-noviq.md + planilha "Controle Financeiro Pessoa Física.xlsx"
repositorio: reezolver/NoviQ_Finance
status: draft (decisões de produto travadas em 2026-06-20)
tipo: especificação técnica de implementação (MVP)
---

# Spec — MVP Noviq Finance

> **Como usar este documento.** É a fonte única de verdade para implementar o MVP. As decisões de produto estão **travadas** (seção 2). O modelo de dados (seção 6) e as regras (seções 7–8) são **prescritivos**. Cada tela (seção 10) tem **critérios de aceite** — uma tela só é "pronta" quando todos passam, nos **dois temas**. Esta spec deriva da pesquisa `pesquisa-arquitetura-mvp-2026-06-20.md`; quando houver dúvida de "porquê", consulte a pesquisa.

---

## 1. Objetivo e princípios

Construir o MVP da Noviq Finance: um SaaS web de organização financeira pessoal que traz a **clareza da planilha** (Planejado × Realizado × Diferença, distribuição 50‑30‑20) para um app moderno. Usado pelo **cliente final** (organiza as próprias finanças) e pelo **educador** (acompanha a carteira e lança no lugar do cliente quando preciso).

Princípios não-negociáveis:
- **Prático, simples, objetivo** — visão financeira clara em poucas telas; baixo atrito no lançamento.
- **Backend-first** — toda decisão de acesso vive no Postgres (RLS) + Server Actions; o frontend nunca decide acesso.
- **Planilha = fonte de verdade** dos cálculos e da taxonomia.
- **Design system existente** — nunca criar componente do zero sem checar `/app/styleguide/`; cor primária `#008CFF`; **dark + light obrigatórios** (regra do `CLAUDE.md`).

---

## 2. Decisões travadas (2026-06-20)

| # | Decisão | Implicação |
|---|---|---|
| 1 | **50‑30‑20** (não 50‑30‑10) | `calcularDistribuicao503020` mantém `0.2`; extrair p/ constante de config |
| 2 | **Zero cartão no MVP** | `lancamentos` **sem** campo de cartão/conta; sem fatura/ciclo |
| 3 | **Planejamento ENTRA** (modo simples) | `orcamentos` = planejado recorrente por categoria; coluna Diferença viva |
| 4 | **Reserva de emergência = 6× despesas mensais** | meta derivada, não digitada |
| 5 | **Dependentes = lista** (vários, cada um com idade) | armazenado na anamnese (`respostas jsonb`) |
| 6 | **Educador = auto-cadastro + aprovação** | `status='pendente'` → master aprova → `'ativo'`; reusa `/aguardando-aprovacao` |
| 7 | **Anamnese = só do gestor que enviou** | RLS `gestor_id = auth.uid()`; master **não** vê anamneses alheias |
| 8 | **Subconta ativa = route segment `[subcontaId]`** | sem troca de sessão; RLS valida acesso |

**Fora do escopo do MVP (não implementar agora):** "Meu Assessor" (IA no WhatsApp), venda para outros educadores (realm separado), geração de contrato, lógica de fatura/ciclo de cartão, dedução automática de objetivo (objetivo é manual no MVP).

---

## 3. Conceito central: Login × Subconta

O briefing usa "conta" para duas coisas distintas. Separar é o que destrava o sistema:

| Conceito | Onde mora | É o quê |
|---|---|---|
| **Login (identidade)** | `auth.users` + `profiles` | quem digita email/senha (master, educador, cliente) |
| **Subconta (carteira)** | `subcontas` + tabelas-filhas | um conjunto de finanças (meses, lançamentos, objetivos, patrimônio…) |

- Um login (educador/master) opera em **várias** subcontas.
- Subconta **`pessoal`** (do gestor) **não tem login próprio** → usa o login do gestor (`owner_user_id = gestor_id`).
- Subconta **`cliente`** **tem login próprio** (`owner_user_id` = login do cliente; pode ser `null` até o login ser criado, ex.: veio de anamnese).

**Regra de acesso (uma frase, vale para todo o sistema):** um login pode operar numa subconta `X` se
`X.owner_user_id = auth.uid()` **ou** `X.gestor_id = auth.uid()` **ou** `is_master() E X.tipo='cliente'`.
→ O master cobre clientes de qualquer educador, **mas nunca a subconta `pessoal` de um educador** (privacidade exigida).

**"Trocar de perfil estilo Instagram" = selecionar a subconta ativa (contexto de workspace), NÃO trocar sessão/token.** O gestor continua logado como ele mesmo; as queries são escopadas pela subconta da URL (`[subcontaId]`); a RLS autoriza.

---

## 4. Estado da fundação (ponto de partida)

- **Frontend pronto:** Next.js 16.2.6, React 19, `@supabase/ssr` 0.10.3 com os 3 clients corretos (`lib/supabase.ts` browser, `lib/supabase-server.ts` server, `middleware.ts`). Design system 100% em `app/styleguide/` + `components/ui/*`. `lib/calculations.ts` com a maioria das fórmulas. `react-hook-form` + `zod`, `recharts`, `sonner`, `next-themes` instalados.
- **Banco zerado:** `public` com **0 tabelas, 0 migrations**. `auth` funcional, 0 usuários. Clean slate — modelo será construído do zero, sem dívida de schema.
- **Dívida da v1 a reconciliar:**
  - `middleware.ts` consulta `profiles` (que não existe ainda) e roteia por `tipo_perfil`/`status`, mas **não conhece subcontas**. Precisa evoluir.
  - `types/financeiro.ts` → `interface Cliente` é o modelo flat antigo; será substituído pelos tipos gerados do schema.
  - `lib/calculations.ts:calcularSaldoFinal` **não** subtrai investimento separado (na planilha o aporte está dentro das Fixas) → no modelo normalizado, separar e subtrair os 4 grupos.

---

## 5. Arquitetura técnica

- **App Router + `@supabase/ssr`** (padrão atual): leituras em **Server Components**; escritas em **Server Actions / Route Handlers** com o server client.
- **Route group de workspace:** `app/(workspace)/[subcontaId]/…` — cada tela/action recebe `subcontaId` explícito e o servidor revalida acesso.
- **`lib/supabase-admin.ts`** (NOVO) — service-role, **server-only**, key **fora** de `NEXT_PUBLIC_*`. Usado só para ops privilegiadas (criar login de cliente, semear categorias, aceitar submissão de anamnese).
- **RLS é a rede de segurança final**; toda action também valida `subcontaId`/papel antes de escrever. Nunca confiar em id vindo do cliente sem RLS.
- **`revalidatePath`/`revalidateTag`** após mutações; `useOptimistic` no lançamento.
- **Tipos TS gerados** do schema via `generate_typescript_types` após cada bloco de migrations (substitui/estende `types/financeiro.ts`).

---

## 6. Modelo de dados (schema `public`)

**Convenções:** ids `uuid` (default `gen_random_uuid()`); dinheiro `numeric(14,2)` (nunca float); datas de lançamento `date`; timestamps `timestamptz default now()`. **RLS ligado em TODAS as tabelas desde a primeira migration** (default-deny: sem policy = sem acesso). Toda tabela com `subconta_id` usa a policy `can_access_subconta(subconta_id)`.

### 6.1 `profiles`
Espelha `auth.users`; criado por trigger `handle_new_user`.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | FK → `auth.users(id)` |
| `tipo_perfil` | enum | `master` \| `educador` \| `cliente` |
| `status` | enum | `ativo` \| `pendente` \| `inativo` |
| `nome` | text | de `raw_user_meta_data` |
| `email` | text | |
| `created_at` | timestamptz | |

**RLS:** o próprio usuário lê/edita seu profile; master lê todos; educador lê profiles dos clientes que gerencia.

### 6.2 `subcontas` (núcleo)
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `tipo` | enum | `pessoal` \| `cliente` |
| `nome` | text | rótulo exibido no seletor de subconta |
| `owner_user_id` | uuid NULL | FK → `auth.users`; login dono (cliente) ou o gestor (pessoal) |
| `gestor_id` | uuid | FK → `auth.users`; educador/master que gerencia |
| `origem_anamnese_id` | uuid NULL | FK → `anamneses`; set ao converter |
| `created_at` | timestamptz | |

**RLS:** `can_access_subconta(id)` (a regra da seção 3, aplicada à própria tabela).

### 6.3 `categorias`
Taxonomia **única por subconta** — fonte única de mapeamento categoria → grupo. Defaults semeados na criação da subconta.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `subconta_id` | uuid | FK → `subcontas` |
| `nome` | text | ex.: Aluguel, Lazer, Uber |
| `grupo` | enum | `renda` \| `fixa` \| `variavel` \| `investimento` |
| `is_default` | boolean | semeada na criação |
| `ordem` | int | ordenação na UI |

**Categorias-semente** (taxonomia da planilha = fonte de verdade): `Transporte`, `Alimentação`, `Lazer`, `Uber` nascem como **`variavel`** (não `fixa`). `renda`: Salário, Investimentos(rendimento). `fixa`: Aluguel, Internet, Gás, Seguro. `investimento`: Aporte.

### 6.4 `lancamentos`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `subconta_id` | uuid | FK → `subcontas` |
| `data` | date | default hoje |
| `valor` | numeric(14,2) | |
| `tipo` | enum | `despesa` \| `receita` \| `objetivo` |
| `categoria_id` | uuid | FK → `categorias` |
| `objetivo_id` | uuid NULL | FK → `objetivos` (quando `tipo='objetivo'`) |
| `descricao` | text NULL | opcional |
| `observacao` | text NULL | opcional |
| `created_by_user_id` | uuid | FK → `auth.users` (auditoria: quem lançou em nome de quem) |
| `created_at` | timestamptz | |

**Sem campo de cartão/conta** (decisão #2). **RLS:** `can_access_subconta(subconta_id)`.

### 6.5 `orcamentos` (o "Planejado", modo simples)
Planejado **recorrente por categoria** (um valor padrão que vale todo mês), com override opcional por mês.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `subconta_id` | uuid | FK → `subcontas` |
| `categoria_id` | uuid | FK → `categorias` |
| `valor_planejado` | numeric(14,2) | |
| `ano` | int NULL | override pontual (NULL = recorrente) |
| `mes` | int NULL | override pontual |

**Realizado é derivado** (soma de `lancamentos`), nunca armazenado.

### 6.6 `objetivos`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `subconta_id` | uuid | FK → `subcontas` |
| `nome` | text | ex.: Casamento |
| `valor_alvo` | numeric(14,2) | |
| `data_limite` | date | |
| `valor_inicial` | numeric(14,2) | |
| `created_at` | timestamptz | |

`valor_acumulado` no MVP = `valor_inicial` + soma de `lancamentos` com `tipo='objetivo'` e `objetivo_id` correspondente. Dedução automática avançada fica **fora** do MVP.

### 6.7 `patrimonio`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `subconta_id` | uuid | FK → `subcontas` |
| `tipo` | enum | `imovel` \| `veiculo` \| `investimento` |
| `descricao` | text | |
| `valor` | numeric(14,2) | |
| `categoria_investimento` | enum NULL | `renda_fixa` \| `renda_variavel` \| `multimercado` |
| `finalidade` | enum NULL | `reserva` \| `patrimonio` |

### 6.8 `dividas`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `subconta_id` | uuid | FK → `subcontas` |
| `tipo` | text | |
| `valor_parcela` | numeric(14,2) | |
| `parcelas_restantes` | int | |
| `taxa` | numeric | |
| `valor_total` | numeric(14,2) | |
| `score_faixa` | text NULL | |

### 6.9 `anamneses`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `gestor_id` | uuid | FK → `auth.users` (dono; **só ele vê**) |
| `nome_lead` | text | |
| `email_lead` | text | |
| `status` | enum | `enviada` \| `preenchida` |
| `respostas` | jsonb | inclui dependentes (lista), renda, etc. |
| `analise` | jsonb | diagnóstico calculado no servidor |
| `token` | text | link público único |
| `subconta_id` | uuid NULL | set ao converter |
| `consentimento_at` | timestamptz NULL | LGPD |
| `created_at` | timestamptz | |
| `preenchida_at` | timestamptz NULL | |

**RLS:** `gestor_id = auth.uid()` **apenas** (decisão #7 — master não vê). A submissão pública grava via **service-role** (lead nunca lê a tabela).

---

## 7. Segurança e permissões (RLS)

- **Default-deny** em todas as tabelas de `public`; sem policy = sem acesso.
- **Papel (`tipo_perfil`) como custom claim no JWT** (`auth.users.raw_app_meta_data`), lido nas policies via `auth.jwt() -> 'app_metadata' ->> 'tipo_perfil'`. Evita consultar `profiles` dentro de policy (sem recursão, mais rápido). Setado na criação do usuário e em mudança de papel. *Trade-off aceito:* mudar papel exige refresh de token.
- **Funções `SECURITY DEFINER`** (esboço; código final nas migrations):

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

create policy "acesso por subconta" on lancamentos
  for all using ( can_access_subconta(subconta_id) )
  with check ( can_access_subconta(subconta_id) );
```

- **Criação de login de cliente** = Server Action com service-role: `auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { tipo_perfil: 'cliente' } })`. `email_confirm: true` resolve o atrito de confirmação de email (known issue). A action **valida primeiro** que `auth.uid()` é educador/master.
- **Trigger `handle_new_user`** (`on auth.users insert`) cria a linha em `profiles` a partir de `raw_user_meta_data`.
- **Seed master** (`reezolver@gmail.com` / `123456`) via migration/seed, `tipo_perfil='master'`, `status='ativo'`. **Credencial provisória de DEV — trocar antes de produção.**
- Rodar **`get_advisors(security)` após cada bloco de migrations** (aponta tabela sem RLS, etc.).

---

## 8. Regras de negócio e cálculos

Fórmulas **centralizadas em `lib/calculations.ts`** (regra do `CLAUDE.md`: nunca cálculo inline em componente). Reaproveitar o que existe; ajustar os pontos abaixo.

- **Saldo do mês = Σrenda − Σfixa − Σvariavel − Σinvestimento** (4 grupos separados). ⚠️ Ajustar `calcularSaldoFinal`, que hoje não separa investimento (na planilha o aporte vive dentro das Fixas; no modelo normalizado ele é grupo próprio).
- **50‑30‑20** (base = renda planejada): Fixo ideal = `0.5×renda`, Variável ideal = `0.3×renda`, Investimento ideal = `0.2×renda`. Extrair os 3 percentuais para uma constante de config.
- **Diferença** (por linha/categoria) = `Planejado − Realizado`. Verde se favorável, vermelho se desfavorável (tokens `text-success` / `text-destructive`).
- **Controle Anual** acompanha o **Saldo mensal**: `Planejado = saldo planejado do mês`, `Realizado = saldo realizado`, `Diferença`. Detalhe por categoria só ao abrir o mês.
- **Objetivo:** usar a fórmula do `calculations.ts` → `necessário/mês = (alvo − acumulado) / meses_restantes`; `meses_restantes = DATEDIF(hoje, data_limite, "m")`. Tratar graciosamente divisão por zero / datas vazias.
- **Investimentos:** distribuição % por `categoria_investimento`; resumo **Reserva vs Patrimônio** por `finalidade`; `Total Aplicado = valor + rentabilidade`.
- **Renda Futura (juros compostos):** `Patrimônio Necessário = (Renda Passiva × 12) / Taxa` (perpetuidade). ⚠️ A planilha **capitaliza anualmente**; `calcularJurosCompostos` capitaliza mensalmente — **alinhar o método** (recomendado: anual, p/ bater com a planilha).
- **Patrimônio Líquido (derivado)** = `Σ patrimonio.valor − Σ dividas.valor_total`.
- **Reserva de emergência (derivado)** = meta `6× despesas mensais`; status = reserva atual ÷ meta.
- **Fonte única de renda:** renda = `lancamentos` `tipo='receita'` (categorias `grupo='renda'`). Renda da anamnese alimenta só o Planejado/inicial (não soma com realizado).
- **"Investimento" desambiguado em 3 coisas:** (1) aporte = `grupo='investimento'`; (2) rendimento que entra = `grupo='renda'`; (3) saldo da carteira = tabela `patrimonio`.

---

## 9. Superfície de Server Actions (mínima do MVP)

Todas com validação `zod`, checagem de papel/`subcontaId` no servidor, e `revalidate*` ao fim.

| Action | Quem | Faz |
|---|---|---|
| `criarLancamento(subcontaId, dados)` | dono/gestor/master | insere em `lancamentos` (`created_by_user_id = auth.uid()`) |
| `editarLancamento` / `removerLancamento` | idem | mutação escopada por RLS |
| `salvarOrcamento(subcontaId, categoriaId, valor, [ano,mes])` | idem | upsert do planejado |
| `criarObjetivo` / `editarObjetivo` | idem | |
| `criarSubconta(tipo, nome, [ownerEmail])` | gestor/master | cria subconta + semeia categorias default (service-role) |
| `criarLoginCliente(subcontaId, email, senha)` | gestor/master | `auth.admin.createUser` + vincula `owner_user_id` |
| `aprovarEducador(userId)` | master | `profiles.status='ativo'` + claim |
| `criarAnamnese(nome, email)` | gestor | gera `token`, status `enviada` |
| `submeterAnamnese(token, respostas, consentimento)` | público (Route Handler) | valida token, grava via service-role, calcula `analise` |
| `converterAnamneseEmSubconta(anamneseId)` | gestor | cria subconta pré-preenchida (+ login opcional) |
| `moverCliente(subcontaId, novoGestorId)` | master | `UPDATE subcontas SET gestor_id` |
| `exportarPdf(subcontaId, periodo)` | dono/gestor/master | gera extrato/relatório |

---

## 10. Telas do MVP (ordem de prioridade + critérios de aceite)

Todas as telas de cliente vivem em `app/(workspace)/[subcontaId]/…`. Validar acesso no servidor em cada uma. **Toda tela validada em dark + light.**

### 10.1 Controle Anual — *primeira tela ao logar*
Panorama Jan–Dez (Planejado, Realizado, Diferença do **saldo** mensal). Visual/"cheia", só visualização.
**Aceite:** mostra os 12 meses com saldo Planejado/Realizado/Diferença; Diferença colorida (verde/vermelho); clicar num mês navega para o Controle Mensal daquele mês; estados vazios tratados (sem dados → zeros, não erro).

### 10.2 Controle Mensal — *a tela mais prática*
3 blocos (**Renda, Despesa Fixa, Despesa Variável**), cada um com Planejado/Realizado/Diferença; gráfico em destaque (estilo app, não réplica de planilha); navegação por meses ao lado; detalhamento por categoria embaixo; resumo 50‑30‑20.
**Aceite:** os 3 blocos somam corretamente a partir de `lancamentos` + `orcamentos`; o resumo 50‑30‑20 compara cada Σ contra 50/30/20 da renda; % de cada categoria sobre a renda exibido; gráfico reflete os dados; trocar de mês mantém a subconta.

### 10.3 Lançamento (modal) — *baixo atrito*
Abas **Despesa / Receita / Objetivo**. Campos: **Valor, Categoria, Data (hoje por padrão)**; Descrição/Observação opcionais e recolhidas. Reusa `dialog`+`form`+`tabs` do design system.
**Aceite:** inputs numéricos `inputMode="decimal"`; validação `zod`+`react-hook-form`; tipo "Objetivo" exige `objetivo_id`; salvar usa `useOptimistic` e revalida; **sem** campo de cartão/conta; abre rápido (1 toque).

### 10.4 Objetivos
Cadastro de meta (nome, valor alvo, data). Mostra valor alvo, data, valor acumulado, valor necessário/mês, progresso.
**Aceite:** progresso = acumulado/alvo; necessário/mês = `(alvo−acumulado)/meses_restantes` com divisão-por-zero tratada; lançamento tipo Objetivo abate da meta (soma manual no MVP).

### 10.5 Painel do Educador/Admin + seletor de subconta
Lista de clientes da carteira; seletor de subconta no topo (UX "trocar de conta"); master vê clientes de qualquer educador.
**Aceite:** selecionar uma subconta navega para `[subcontaId]` e escopa todas as queries; educador **não** vê subconta `pessoal` de outro educador; master **não** vê `pessoal` de educador; mover cliente entre gestores funciona (master).

### 10.6 Investimentos (secundária / "plus")
Carteira: categoria (renda fixa/variável/multimercado), finalidade (reserva/patrimônio), distribuição. Discreta por padrão.
**Aceite:** distribuição % por categoria; resumo Reserva vs Patrimônio; PL e reserva de emergência (6×) exibidos como derivados.

### 10.7 Renda Futura (aposentadoria)
Juros compostos: aporte inicial/mensal, taxa, idade atual/alvo, renda passiva desejada → patrimônio necessário + projeção ano a ano.
**Aceite:** capitalização **anual** (alinhada à planilha); patrimônio necessário = `(renda passiva×12)/taxa`; projeção ano a ano renderizada.

### 10.8 Anamnese / Ficha financeira (perfil educador/admin) — *prioritário*
Ver seção 11.

### 10.9 Exportar PDF (desejável)
Extrato/relatório dos lançamentos do mês para enviar no WhatsApp. Ver seção 12.

### Conceito de UX — "menu avançado"
Visão padrão **mínima**; toggle **"avançado"** (estilo Photoshop Essencial/Avançado) revela funções extras. Manter o mínimo na cara do usuário.

---

## 11. Fluxo de anamnese

1. Gestor cria anamnese → gera `token` → **link público** `app/anamnese/[token]/page.tsx` (sem auth).
2. Lead preenche (inclui **dependentes como lista**, renda, consentimento LGPD → `consentimento_at`).
3. **Submissão** via Route Handler que valida o `token` e grava com **service-role** (RLS de `anamneses` fica travada em `gestor_id`; lead nunca lê).
4. No submit, calcular a **`analise`** (diagnóstico) no servidor a partir de `respostas` + modelo da planilha; guardar em `jsonb`.
5. Gestor **lista/busca/filtra por nome** (RLS `gestor_id = auth.uid()`), vê detalhes, exporta PDF.
6. **Converter em subconta:** Server Action cria `subcontas` pré-preenchida a partir de `respostas` (categorias, planejado inicial, patrimônio, dívidas, objetivos) + login opcional. Ou mantém salva, ou descarta.
- **Mapeamento anamnese → grupos:** as perguntas devem cair nos mesmos `grupos` da planilha (ex.: Transporte/Alimentação/Lazer → `grupo='variavel'`). *(Open question — ver seção 15.)*

---

## 12. Export PDF

- **Recomendado (estruturado):** `@react-pdf/renderer` — declarativo, sem headless browser, amigável a Vercel/serverless. Bom p/ diagnóstico em cards e extrato do mês.
- **Mínimo (mais barato):** rota com CSS `@media print` + `window.print()` — zero infra; serve p/ extrato simples.
- **Evitar Puppeteer/Playwright** no Vercel (peso/cold start). Gráficos `recharts` em PDF → renderizar como imagem.

---

## 13. Requisitos não-funcionais

- **Design system:** nunca criar componente do zero sem checar `/app/styleguide/`; cor primária via `bg-primary`/`text-primary`; **nunca cores hardcoded**; verde=`text-success`, vermelho=`text-destructive`. **Dark + light obrigatórios** em tudo.
- **TypeScript estrito** (sem `any`); tipos gerados do schema.
- **Mobile-first**, baixo atrito.
- **LGPD/segurança:** RLS default-deny; service-role só no servidor; auditoria via `created_by_user_id`; consentimento na anamnese; privacidade do educador garantida pela RLS; trocar credencial seed antes de produção; `get_advisors(security)` após cada bloco de migrations.
- **Deploy:** push → Vercel (deploy automático do GitHub `reezolver/NoviQ_Finance`); sem `npm run dev` local como fluxo padrão.

---

## 14. Sequência de implementação (milestones)

| M | Entrega | Conteúdo |
|---|---|---|
| **M0** | Schema + segurança | Migrations: `profiles`+trigger, `subcontas`, `categorias`, `lancamentos`, depois objetivos/patrimônio/dívidas/orçamentos/anamneses — **RLS desde a 1ª tabela**. `is_master()`/`can_access_subconta()`. |
| **M1** | Bootstrap de acesso | Seed master; `lib/supabase-admin.ts`; actions criar educador/cliente; aprovação de educador. |
| **M2** | Roteamento | Atualizar `middleware.ts` (dashboard gestão vs financeiro); route group `(workspace)/[subcontaId]`. |
| **M3** | Cliente core | Controle Anual → Mensal → Lançamento → Objetivos. |
| **M4** | Gestão | Painel do educador/master + seletor de subconta + mover cliente. |
| **M5** | Anamnese | Link público → submissão → diagnóstico → converter em subconta. |
| **M6** | Avançadas | Investimentos/Patrimônio, Renda Futura, Export PDF. |

---

## 15. Open questions / riscos

- **Mapeamento anamnese → grupos da planilha** — as perguntas precisam ser mapeadas para os mesmos `grupos`/categorias (ex.: Transporte/Alimentação/Lazer → `variavel`). Definir antes do M5.
- **Protótipo da tela de Análise/Diagnóstico** mencionado no briefing — confirmar onde está (possivelmente em `_arquivo-v1/`).
- **Versionar a planilha** — guardar uma cópia/export de `Controle Financeiro Pessoa Física.xlsx` dentro de `noviq-app/` (fonte de verdade fora do repo hoje).
- **Reconciliar `middleware.ts` e `types/financeiro.ts`** da v1 (evoluir, não recriar) — incluído no M2.

---

## 16. Definition of Done (MVP)

- [ ] Schema completo com RLS default-deny; `get_advisors(security)` limpo.
- [ ] Master seed + criação de educador (auto-cadastro+aprovação) + criação de login de cliente funcionando.
- [ ] Cliente faz login e cai no Controle Anual da própria subconta.
- [ ] Educador entra na subconta de um cliente (via seletor/`[subcontaId]`) e lança por ele, com auditoria.
- [ ] Master vê clientes de qualquer educador, mas **não** subcontas `pessoal`.
- [ ] Controle Anual/Mensal/Lançamento/Objetivos completos, cálculos batendo com a planilha.
- [ ] Anamnese: link público → submissão → diagnóstico → conversão em subconta; só o gestor vê.
- [ ] Tudo validado em **dark + light**; sem cores hardcoded; sem `any`.
