# Spec 09 — Investimentos / Patrimônio · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `meu-projeto/specs/_contexto-base.md`
- `meu-projeto/prompts/spec-mvp-noviq-2026-06-20.md` §10.6 e §8 (derivados: PL, reserva 6×)
- `types/financeiro.ts` (`Investimento`, `TipoInvestimento`, `FinalidadeInvestimento`)
- tabelas `patrimonio` e `dividas` (Spec 00, Bloco 8)

## 1. Pré-requisitos
- [ ] **Specs 00–04** (schema + workspace + mensal, de onde sai a "despesa mensal" para a reserva).

## 2. Objetivo
Construir a visão de **carteira/patrimônio** (secundária / "plus" — discreta por padrão): ativos
por **categoria** (renda fixa / variável / multimercado) e **finalidade** (reserva / patrimônio),
distribuição, e os **derivados**: **Patrimônio Líquido** e **Reserva de emergência (meta 6×)**.

## 3. Tarefa
- Rota: `app/(workspace)/[subcontaId]/investimentos/page.tsx` (Server Component).
- **CRUD de patrimônio:** `app/actions/patrimonio.ts` — criar/editar/remover linhas em `patrimonio` (tipo, descrição, valor, rentabilidade, `categoria_investimento`, `finalidade`). Idem dívidas se necessário (`app/actions/dividas.ts`).
- **Distribuição %** por `categoria_investimento` (gráfico `chart`/recharts).
- **Resumo Reserva vs Patrimônio** por `finalidade`.
- **Total Aplicado** = `valor + rentabilidade`.
- **Discreto por padrão:** integrar com o conceito de **"menu avançado"** (toggle estilo Photoshop) — a tela existe mas não polui a visão mínima do cliente.

## 4. Regras / cálculos (centralizar em `lib/calculations.ts`)
- **Patrimônio Líquido (derivado)** = `Σ patrimonio.valor − Σ dividas.valor_total`.
- **Reserva de emergência (derivado)** = meta `6× despesas mensais` (decisão #4); **status** = reserva atual ÷ meta. "Despesas mensais" = média/realizado de `fixa + variavel` do mês (reusar agregação do Spec 04).
- **"Investimento" desambiguado:** esta tela é o **saldo da carteira** (tabela `patrimonio`), distinto do **aporte** (lançamento `grupo='investimento'`) e do **rendimento que entra** (`grupo='renda'`).
- Formatação via `formatarMoeda`.

## 5. Arquivos a criar / tocar
- `app/(workspace)/[subcontaId]/investimentos/page.tsx`
- `app/actions/patrimonio.ts` (+ `dividas.ts` se preciso)
- `lib/calculations.ts` (PL e reserva como funções derivadas)
- `components/investimentos/*` — via design system

## 6. Critérios de aceite

### Automáticos
- [ ] `npm run build` e `npm run lint` passam.
- [ ] PL e reserva calculados em `lib/calculations.ts` (sem inline).

### Manuais
- [ ] Distribuição % por categoria e resumo Reserva vs Patrimônio batem com dados de teste.
- [ ] PL = patrimônio − dívidas; reserva mostra meta 6× e status (atual ÷ meta).
- [ ] Tela discreta na visão mínima; aparece completa no modo avançado.
- [ ] **dark + light**.

## 7. Fora de escopo
- Integração com corretora/cotações em tempo real. Parceria/assessoria externa (Gustavo/XP) — só visão estática no MVP.
