# Spec 03 — Tela Controle Anual · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `meu-projeto/specs/_contexto-base.md`
- `meu-projeto/prompts/spec-mvp-noviq-2026-06-20.md` §10.1 e §8 (regras)
- `lib/calculations.ts` (`calcularSaldoFinal`, `calcularDiferenca`, `formatarMoeda`)
- `app/styleguide/components/*` (ver `card`, `table`, `chart` antes de montar a UI)

## 1. Pré-requisitos
- [ ] **Specs 00–02** (schema, acesso, route group `(workspace)/[subcontaId]`).

## 2. Objetivo
Construir a **primeira tela do cliente ao logar**: um panorama **Jan–Dez** do **saldo mensal**
(Planejado / Realizado / Diferença). Tela visual e "cheia", **só de visualização**. Clicar num
mês navega para o Controle Mensal daquele mês.

## 3. Tarefa
- Rota: `app/(workspace)/[subcontaId]/controle-anual/page.tsx` (Server Component). Aceita `?ano=` (default ano atual).
- **Dados (no servidor):** para cada mês do ano, calcular o **saldo**:
  - **Realizado:** a partir de `lancamentos` do mês → `Σrenda − Σfixa − Σvariavel − Σinvestimento` (grupos vêm de `categorias.grupo`). Use uma função em `lib/calculations.ts` (ver §8 do spec-mestre — `calcularSaldoFinal` precisa evoluir para 4 grupos; faça isso no **Spec 04** e reuse aqui, ou crie `calcularSaldoMes(totais: TotaisData)` já com os 4 grupos).
  - **Planejado:** a partir de `orcamentos` (recorrente + override do mês) → mesmo cálculo de saldo.
  - **Diferença:** `Planejado − Realizado` (sinal/cores conforme regra abaixo).
- Buscar tudo em **1–2 queries** agregadas (evite N+1 por mês). Ex.: uma query de lançamentos do ano agrupada por mês/grupo; uma de orçamentos.
- **UI:** grade/tabela dos 12 meses (use `table` ou `card` grid do styleguide). Cada linha/card: nome do mês, Saldo Planejado, Realizado, Diferença. Opcional: um `chart` (recharts) de barras/linha do saldo ao longo do ano em destaque.
- **Navegação:** clicar no mês → `Link` para `/[subcontaId]/mensal/[ano]/[mes]`.

## 4. Regras de negócio / cálculos
- **Saldo do mês = Σrenda − Σfixa − Σvariavel − Σinvestimento** (4 grupos separados; o aporte/investimento é subtraído do saldo).
- **Diferença = Planejado − Realizado.** Cor: para **saldo**, Realizado ≥ Planejado é favorável (`text-success`); abaixo é `text-destructive`. (Confirme a convenção de cor com o spec-mestre §8 ao implementar — o importante é: bom = verde, ruim = vermelho.)
- **Estados vazios:** mês sem dados → mostra zeros, **nunca erro**. Datas/divisões tratadas graciosamente.
- Toda formatação monetária via `formatarMoeda`.

## 5. Arquivos a criar / tocar
- `app/(workspace)/[subcontaId]/controle-anual/page.tsx`
- `lib/calculations.ts` (adicionar `calcularSaldoMes` se ainda não existir)
- componentes auxiliares em `components/controle-anual/` se necessário (sempre via design system)

## 6. Critérios de aceite

### Automáticos
- [x] `npm run build` e `npm run lint` passam.
- [x] Sem cálculo financeiro inline no componente (tudo em `lib/calculations.ts`).
- [x] Sem cores hardcoded (`grep` por `#` em classes/estilos da tela = só tokens).

### Manuais
- [ ] Mostra os 12 meses com Saldo Planejado/Realizado/Diferença corretos para uma subconta com lançamentos de teste; números batem com a conta `Renda − Fixa − Variável − Investimento`.
- [ ] Diferença colorida (verde favorável / vermelho desfavorável).
- [ ] Clicar num mês abre `/[subcontaId]/mensal/[ano]/[mes]` da **mesma** subconta.
- [ ] Subconta sem dados → zeros, sem erro.
- [ ] Validada em **dark + light**; responsiva (mobile-first).

## 7. Fora de escopo
- Detalhe por categoria (aparece no Controle Mensal — Spec 04). Edição de dados nesta tela (é só visualização).
