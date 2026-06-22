# Spec 06 — Tela Objetivos · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `noviq-app/specs/_contexto-base.md`
- `noviq-app/prompts/spec-mvp-noviq-2026-06-20.md` §10.4 e §8
- `lib/calculations.ts` (`calcularProgressoObjetivo`, `calcularNecessarioMensal`, `calcularMesesRestantes`, `calcularStatusObjetivo`)
- `types/financeiro.ts` (`Objetivo`) · `components/ProgressBar.tsx` · `app/styleguide/components/progress`

## 1. Pré-requisitos
- [ ] **Specs 00–02** e **05** (lançamento tipo Objetivo).

## 2. Objetivo
Permitir ao cliente **cadastrar metas** (ex.: Casamento, R$ 50.000, até uma data) e acompanhar
**valor alvo, data, valor acumulado, valor necessário/mês e progresso**. Lançamento do tipo
Objetivo **abate da meta** (soma manual no MVP).

## 3. Tarefa
- Rota: `app/(workspace)/[subcontaId]/objetivos/page.tsx` (Server Component) + modal de criar/editar (client, `dialog`+`form`+`zod`).
- **Cadastro:** nome, `valor_alvo`, `data_limite`, `valor_inicial` (opcional). Server Action `criarObjetivo` / `editarObjetivo` em `app/actions/objetivos.ts`.
- **Cálculo de acumulado (MVP):** `valor_acumulado = valor_inicial + Σ lancamentos (tipo='objetivo', objetivo_id = este)`. Faça no servidor.
- **Cards de objetivo** (via `card` + `progress`/`ProgressBar`): exibir valor alvo, data limite, acumulado, **necessário/mês**, **progresso %**, e status (no prazo / atrasado).

## 4. Regras / cálculos (reusar `lib/calculations.ts`)
- **Progresso %** = `calcularProgressoObjetivo(acumulado, alvo)` (trata alvo 0).
- **Necessário/mês** = `calcularNecessarioMensal(alvo, acumulado, mesesRestantes)` → `(alvo − acumulado) / meses_restantes`; **divisão por zero/datas vencidas tratadas** (retorna 0).
- **Meses restantes** = `calcularMesesRestantes(data_limite)` (0 se já passou).
- **Status** = `calcularStatusObjetivo(...)` → `no_prazo` (`text-success`) | `atrasado` (`text-destructive`).
- Formatação via `formatarMoeda`.

## 5. Arquivos a criar / tocar
- `app/(workspace)/[subcontaId]/objetivos/page.tsx`
- `app/actions/objetivos.ts` (NOVO)
- `components/objetivos/*` (card, modal) — via design system
- (opcional) garantir que o `select` de objetivos do modal de lançamento (Spec 05) lê desta tabela

## 6. Critérios de aceite

### Automáticos
- [x] `npm run build` e `npm run lint` passam.
- [x] Cálculos só via `lib/calculations.ts` (sem inline).

### Manuais
- [ ] Criar objetivo (Casamento, R$ 50.000, data futura) mostra progresso 0% e necessário/mês = alvo/meses.
- [ ] Um lançamento tipo Objetivo vinculado **aumenta o acumulado** e o progresso.
- [ ] Objetivo com data passada → status "atrasado", necessário/mês = 0 (sem crash por divisão).
- [ ] **dark + light**; mobile-first.

## 7. Fora de escopo
- Dedução/realocação automática avançada entre objetivos (fora do MVP). Aportes recorrentes automáticos.
