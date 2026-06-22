# Spec 04 — Tela Controle Mensal · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `noviq-app/specs/_contexto-base.md`
- `noviq-app/prompts/spec-mvp-noviq-2026-06-20.md` §10.2 e §8
- `lib/calculations.ts` (todas as funções) · `types/financeiro.ts` (`TotaisData`, `SaldosData`)
- `app/styleguide/components/chart` e `table` (ver antes de montar)

## 1. Pré-requisitos
- [ ] **Specs 00–02**. (Lançamento — Spec 05 — pluga o botão "novo lançamento"; pode ser stub aqui.)

## 2. Objetivo
Construir **a tela mais prática do app**: o mês com **3 blocos (Renda, Despesa Fixa, Despesa
Variável)**, cada um com **Planejado / Realizado / Diferença**, um **gráfico em destaque** (estilo
app, **não** réplica de planilha), navegação por meses ao lado, detalhamento por categoria embaixo
e o **resumo 50‑30‑20**.

## 3. Tarefa
- Rota: `app/(workspace)/[subcontaId]/mensal/[ano]/[mes]/page.tsx` (Server Component).
- **Dados (servidor):** lançamentos do mês + orçamentos. Agregue por `categorias.grupo` para os totais e por categoria para o detalhamento. Monte um `SaldosData` (planejado/realizado por grupo).
- **3 blocos** (`card` do styleguide): Renda, Despesa Fixa, Despesa Variável. **Investimento (aporte)** aparece no resumo 50‑30‑20 e no saldo, não como 4º bloco grande (decisão de UX — confirme com o spec-mestre; manter alinhado à planilha onde o aporte é o "20%").
- Cada bloco: Planejado, Realizado, Diferença por linha + total.
- **Gráfico em destaque:** `recharts` via `components/ui/chart` — ex.: Planejado vs Realizado por grupo, ou pizza da distribuição. Renderizar como imagem só é necessário no PDF (Spec 11), não aqui.
- **Detalhamento por categoria** (embaixo): tabela com cada categoria, seu valor realizado e o **% sobre a renda** (`calcularPercentual`).
- **Resumo 50‑30‑20:** comparar Σfixa / Σvariavel / Σinvestimento contra 50% / 30% / 20% da renda (`calcularDistribuicao503020`).
- **Navegação por meses:** componente lateral/superior com os meses; trocar de mês **mantém a subconta** (`[subcontaId]`).
- Botão **"Novo lançamento"** abre o modal do Spec 05 (stub por enquanto se 05 ainda não existe).

## 4. Regras de negócio / cálculos (⚠️ ajustes obrigatórios em `lib/calculations.ts`)
- **`calcularSaldoFinal` precisa evoluir:** hoje é `renda − fixas − variaveis` e **não** subtrai investimento. No modelo normalizado, **saldo = renda − fixa − variável − investimento** (4 grupos). Adicione/ajuste para uma versão que receba os 4 grupos (ex.: `calcularSaldoMes(t: TotaisData)`), mantendo retrocompat se preciso.
- **50‑30‑20:** base = **renda planejada**; ideais = `0.5 / 0.3 / 0.2 × renda`. Extraia os percentuais para uma constante de config (ex.: `REGRA_503020 = { fixa: 0.5, variavel: 0.3, investimento: 0.2 }`).
- **Diferença por linha/categoria = Planejado − Realizado**; cor: bom = `text-success`, ruim = `text-destructive`.
- **Realizado é sempre derivado** de `lancamentos` (nunca armazenado). **Planejado** vem de `orcamentos` (recorrente + override do mês).
- Renda = `lancamentos` `tipo='receita'` / categorias `grupo='renda'`.

## 5. Arquivos a criar / tocar
- `app/(workspace)/[subcontaId]/mensal/[ano]/[mes]/page.tsx`
- `lib/calculations.ts` (ajustar saldo p/ 4 grupos + constante 50‑30‑20)
- `components/mensal/*` (blocos, navegação de meses, resumo 50‑30‑20) — via design system

## 6. Critérios de aceite

### Automáticos
- [ ] `npm run build` e `npm run lint` passam.
- [ ] `lib/calculations.ts` exporta a constante `REGRA_503020` (ou equivalente) e o saldo de 4 grupos; nenhum cálculo inline na page.
- [ ] Sem cores hardcoded.

### Manuais
- [ ] Os 3 blocos somam corretamente a partir de `lancamentos` + `orcamentos` de teste.
- [ ] Saldo do mês = `renda − fixa − variável − investimento` (confere com cálculo manual).
- [ ] Resumo 50‑30‑20 compara cada grupo com 50/30/20 da renda; % de cada categoria sobre a renda exibido.
- [ ] Gráfico reflete os dados; trocar de mês mantém a subconta.
- [ ] **dark + light**; mobile-first.

## 7. Fora de escopo
- O modal de lançamento em si (Spec 05). Objetivos (Spec 06). Export PDF (Spec 11).
