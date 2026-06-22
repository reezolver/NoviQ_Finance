# Spec 08 — Anamnese / Ficha financeira · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `noviq-app/specs/_contexto-base.md`
- `noviq-app/prompts/spec-mvp-noviq-2026-06-20.md` §11 (fluxo) e §6.9 (tabela `anamneses`)
- `lib/supabase-admin.ts` (Spec 01 — service-role) · `app/actions/subcontas.ts`

## 1. Pré-requisitos
- [x] **Specs 00–02** (tabela `anamneses` com RLS `gestor_id = auth.uid()`; `subcontas`/`categorias`).
- [x] **Spec 07** (painel onde o gestor gerencia as anamneses).
- [x] Antes do M5: **resolver o mapeamento anamnese → grupos da planilha** (ver §6 deste spec). → `MAPA_CATEGORIAS` em `lib/anamnese.ts` + doc no topo de `app/actions/anamneses.ts`.

## 2. Objetivo
Construir o fluxo de anamnese (prioritário — o Thiago está saindo do Upify): gestor cria e envia
um **link público**; o lead preenche; o gestor recebe o **panorama financeiro completo antes da
reunião**, com **diagnóstico**; e pode **converter a anamnese em subconta** pré-preenchida. A
anamnese é **só do gestor que enviou** (master não vê — decisão #7).

## 3. Tarefa
1. **Criar/listar (gestor):** Server Action `criarAnamnese(nome_lead, email_lead)` gera `token` único, `status='enviada'`. Tela de gestão (no painel) lista/**busca/filtra por nome**, mostra status e detalhes (RLS `gestor_id = auth.uid()`).
2. **Link público:** `app/anamnese/[token]/page.tsx` — **sem auth** (incluir na lista de rotas públicas do middleware, Spec 02). Formulário do lead: dados pessoais, **dependentes como lista** (vários, cada um com idade — decisão #5), renda, despesas, patrimônio/dívidas, objetivos, e **consentimento LGPD** (checkbox → `consentimento_at`).
3. **Submissão:** **Route Handler** `app/api/anamnese/[token]/route.ts` (POST) que valida o `token` e grava com **service-role** (`createSupabaseAdminClient`) — a tabela fica com RLS travada em `gestor_id`, o lead **nunca lê** anamneses. Seta `status='preenchida'`, `preenchida_at`, `respostas` (jsonb).
4. **Diagnóstico (`analise`):** no submit, calcular no servidor a partir de `respostas` + modelo da planilha (saldo, 50‑30‑20, reserva 6×, PL) e gravar em `analise` (jsonb). Reaproveitar `lib/calculations.ts`.
5. **Converter em subconta:** Server Action `converterAnamneseEmSubconta(anamneseId)` (gestor): cria `subcontas` (`origem_anamnese_id`) **pré-preenchida** a partir de `respostas` — categorias (com os grupos certos), planejado inicial (`orcamentos`), patrimônio, dívidas, objetivos — e **opcionalmente** o login do cliente (`criarLoginCliente`). Alternativas: manter salva ou descartar.

## 4. Segurança
- RLS de `anamneses`: **`gestor_id = auth.uid()` apenas** (master não vê — já criada no Spec 00).
- Submissão pública **sempre** via service-role no Route Handler; **nunca** abrir policy de SELECT público. Validar o `token` antes de gravar; tratar token inválido/expirado.
- Consentimento LGPD obrigatório para submeter.

## 5. Arquivos a criar / tocar
- `app/anamnese/[token]/page.tsx` (público) + `app/api/anamnese/[token]/route.ts` (submissão)
- `app/actions/anamneses.ts` (NOVO) — `criarAnamnese`, `converterAnamneseEmSubconta`
- `components/anamnese/*` (formulário, lista no painel, view de diagnóstico)
- `lib/calculations.ts` (reuso; funções de diagnóstico se necessário)

## 6. Open question a resolver antes (mapeamento)
As perguntas da anamnese **precisam cair nos mesmos `grupos` da planilha** (ex.: Transporte/Alimentação/Lazer → `grupo='variavel'`, não `fixa`). Defina o mapeamento pergunta→categoria→grupo **antes** de codar a conversão. Documente o mapa no topo de `app/actions/anamneses.ts`.

## 7. Critérios de aceite

### Automáticos
- [x] `npm run build` e `npm run lint` passam.
- [x] Route Handler de submissão usa **service-role**; nenhuma policy de SELECT público em `anamneses` (`get_advisors(security)` limpo p/ `anamneses`).

### Manuais
- [ ] Gestor cria anamnese → recebe link público; abrir o link **sem login** mostra o formulário.
- [ ] Lead preenche (com dependentes em lista + consentimento) e envia; submissão sem consentimento é barrada.
- [ ] Submetida, a anamnese aparece para o **gestor que enviou** com status "preenchida" + diagnóstico; **outro gestor e o master NÃO a veem**.
- [ ] Converter em subconta cria a subconta pré-preenchida (categorias com grupos corretos) e, opcionalmente, o login do cliente.
- [ ] Busca/filtro por nome funciona; **dark + light**.

## 8. Fora de escopo
- IA/automação de preenchimento ("Meu Assessor" — fora do MVP). Export PDF do diagnóstico (Spec 11). Geração de contrato.
