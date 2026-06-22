# Spec 10 — Renda Futura (juros compostos / aposentadoria) · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `noviq-app/specs/_contexto-base.md`
- `noviq-app/prompts/spec-mvp-noviq-2026-06-20.md` §10.7 e §8
- `lib/calculations.ts` (`calcularJurosCompostos`, `ProjetoJurosCompostos`, `AnoProjetado`) — **leia inteiro**

## 1. Pré-requisitos
- [ ] **Specs 00–02** (workspace). Não depende de dados de lançamentos — é uma calculadora.

## 2. Objetivo
Construir a tela de **aposentadoria/renda passiva**: dados o aporte inicial/mensal, taxa, idade
atual/alvo e renda passiva desejada, calcular o **patrimônio necessário** e a **projeção ano a
ano** dos juros compostos.

## 3. Tarefa
- Rota: `app/(workspace)/[subcontaId]/renda-futura/page.tsx`. Pode ser uma calculadora client-side (form + resultado) — não precisa persistir no MVP (ou persistir os inputs na subconta se quiser; opcional).
- **Inputs:** Aporte Inicial, Aporte Mensal, Taxa Média (anual %), Idade Atual, Idade-alvo, Renda Passiva Desejada.
- **Saídas:** Patrimônio Necessário, patrimônio final projetado, total aportado, rendimento total, renda passiva mensal, e **projeção ano a ano** (tabela + gráfico `chart`).

## 4. Regras / cálculos (⚠️ alinhar método com a planilha)
- **Patrimônio Necessário = (Renda Passiva × 12) / Taxa** (perpetuidade).
- **⚠️ Capitalização:** a planilha (fonte de verdade) **capitaliza ANUALMENTE** (`C(n+1) = (C(n) + aporte_mensal×12) × (1 + taxa)`). A função atual `calcularJurosCompostos` em `lib/calculations.ts` **capitaliza ao MÊS** (`M = P(1+i)^n + PMT((1+i)^n − 1)/i`). **Alinhe ao método anual** para bater com a planilha do Thiago — ajuste a função (ou crie `calcularRendaFuturaAnual`) e documente a escolha no JSDoc.
- Usar `idade-alvo − idade atual` como horizonte (anos). Formatação via `formatarMoeda`.

## 5. Arquivos a criar / tocar
- `app/(workspace)/[subcontaId]/renda-futura/page.tsx`
- `lib/calculations.ts` (ajustar/adicionar a versão de capitalização anual)
- `components/renda-futura/*` (form, tabela/gráfico de projeção) — via design system

## 6. Critérios de aceite

### Automáticos
- [x] `npm run build` e `npm run lint` passam.
- [x] `lib/calculations.ts` tem a versão de capitalização **anual** com JSDoc explicando o alinhamento à planilha.

### Manuais
- [ ] Com inputs de teste iguais aos de uma aba "Renda Futura" da planilha, os números **batem** (patrimônio necessário e projeção ano a ano).
- [ ] Projeção ano a ano renderizada (tabela + gráfico); patrimônio necessário = (renda passiva × 12)/taxa.
- [ ] Casos de borda (taxa 0, idade-alvo ≤ atual) tratados sem crash.
- [ ] **dark + light**.

## 7. Fora de escopo
- Inflação/imposto na projeção. Cenários múltiplos comparados. Integração com a carteira real (Spec 09).
