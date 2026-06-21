# Spec 05 — Modal de Lançamento (baixo atrito) · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `meu-projeto/specs/_contexto-base.md`
- `meu-projeto/prompts/spec-mvp-noviq-2026-06-20.md` §10.3 e §9
- `app/styleguide/components/dialog`, `form`, `tabs`, `select` (ver antes de montar)
- `lib/supabase-server.ts` (server client p/ a action)

## 1. Pré-requisitos
- [ ] **Specs 00–02**. Idealmente **04** (para plugar o botão "Novo lançamento" na tela mensal).

## 2. Objetivo
Construir o **modal de lançamento rápido** — a operação mais frequente, com **mínimo atrito** (o
do Upify é cansativo). Abas **Despesa / Receita / Objetivo**; campos mínimos; salvar otimista.

## 3. Tarefa
- Componente client `components/lancamento/LancamentoModal.tsx` usando `dialog` + `tabs` + `form` (react-hook-form + zod).
- **Abas = tipo do lançamento:** `despesa` · `receita` · `objetivo`.
- **Campos mínimos:** **Valor** (`input` `inputMode="decimal"`), **Categoria** (`select`, filtrado pelo grupo conforme a aba), **Data** (`input type=date`, **default hoje**). **Descrição** e **Observação** opcionais e **recolhidas** (mostrar só ao expandir).
- Aba **Objetivo:** em vez de categoria, escolhe um **Objetivo** (`select` de `objetivos` da subconta) → grava `objetivo_id`; `categoria_id` pode ficar nulo (ou categoria especial). Esse lançamento **abate da meta** (soma manual no MVP — ver Spec 06).
- **Server Action** `criarLancamento(subcontaId, dados)` em `app/actions/lancamentos.ts`:
  - valida com `zod`; insere em `lancamentos` com `created_by_user_id` = `auth.uid()` (default da coluna já faz isso, mas valide o acesso à subconta).
  - `revalidatePath` da tela mensal/anual.
- **UX otimista:** usar `useOptimistic` para refletir o lançamento na hora; `sonner` para toast de sucesso/erro.
- **SEM** campo de cartão/conta (decisão #2).

## 4. Regras / contratos
- `tipo ∈ {despesa, receita, objetivo}`. Categoria coerente com o tipo: receita → grupo `renda`; despesa → grupos `fixa`/`variavel`/`investimento`.
- Valor `numeric(14,2)` no banco; no form, validar > 0 e parsear vírgula/ponto BR.
- A action **sempre** valida `subcontaId` no servidor (a RLS é a rede final, mas valide também).

## 5. Arquivos a criar / tocar
- `components/lancamento/LancamentoModal.tsx` (NOVO)
- `app/actions/lancamentos.ts` (NOVO) — `criarLancamento`, `editarLancamento`, `removerLancamento`
- Plug do botão "Novo lançamento" na tela mensal (Spec 04) e/ou um FAB global no workspace.

## 6. Critérios de aceite

### Automáticos
- [x] `npm run build` e `npm run lint` passam.
- [x] Schema `zod` cobre os 3 tipos; sem `any`.
- [x] `grep` confirma **nenhum** campo de cartão/conta no form nem na action.

### Manuais
- [ ] Modal abre em **1 toque**; data já vem com hoje; valor aceita decimal no mobile (`inputMode`).
- [ ] Salvar uma despesa variável aparece **na hora** (otimista) e persiste após reload, refletindo no Realizado do mês (Spec 04).
- [ ] Lançamento tipo Objetivo grava `objetivo_id` e abate da meta (Spec 06).
- [ ] Erro de validação mostra mensagem amigável (`sonner`); descrição/observação ficam recolhidas até expandir.
- [ ] **dark + light**.

## 7. Fora de escopo
- Edição em massa / importação. Recorrência automática de lançamento. Dedução automática avançada de objetivo (fora do MVP).
