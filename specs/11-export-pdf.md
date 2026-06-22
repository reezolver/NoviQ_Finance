# Spec 11 — Exportar PDF (extrato / diagnóstico) · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `meu-projeto/specs/_contexto-base.md`
- `meu-projeto/prompts/spec-mvp-noviq-2026-06-20.md` §12 e §10.9

## 1. Pré-requisitos
- [x] **Spec 04** (Controle Mensal — fonte do extrato). Para o diagnóstico, **Spec 08** (anamnese).

## 2. Objetivo
Gerar um **"extrato"/relatório em PDF** dos lançamentos do mês (e/ou o diagnóstico da anamnese)
para o educador enviar ao cliente no WhatsApp. Funcionalidade **desejável** — manter simples.

## 3. Tarefa (escolher 1 abordagem)
- **Recomendado (estruturado): `@react-pdf/renderer`** — declarativo (React → PDF), **sem headless browser**, amigável a Vercel/serverless. Bom para o diagnóstico em cards e o extrato do mês. `npm i @react-pdf/renderer`. Gerar via Route Handler `app/api/export/[subcontaId]/route.ts` (valida acesso no servidor) que retorna o PDF como stream/download.
- **Mínimo (mais barato):** rota dedicada com **CSS `@media print`** + `window.print()` — zero infra; serve para um extrato simples.
- **EVITAR Puppeteer/Playwright** no Vercel (peso/cold start).
- **Gráficos `recharts` em PDF:** não renderizam direto; se precisar do gráfico no PDF, renderize como **imagem** (ou omita no MVP e use tabelas).

## 4. Conteúdo do PDF
- **Extrato do mês:** cabeçalho (cliente/subconta, mês/ano), 3 blocos (Renda/Fixa/Variável) com Planejado/Realizado/Diferença, resumo 50‑30‑20, saldo do mês. Dados via as mesmas agregações do Spec 04 (reusar, não duplicar cálculo).
- **Diagnóstico (anamnese):** opcional — cards do `analise` (jsonb) gerado no Spec 08.
- Valores via `formatarMoeda`; respeitar a identidade visual (cor primária, tipografia) na medida do possível.

## 5. Arquivos a criar / tocar
- `app/api/export/[subcontaId]/route.ts` (NOVO) — geração e download
- `components/pdf/*` (templates `@react-pdf/renderer`) **ou** `app/(workspace)/[subcontaId]/extrato/print/page.tsx` (abordagem print)
- `package.json` — `@react-pdf/renderer` se optar pela estruturada

## 6. Critérios de aceite

### Automáticos
- [x] `npm run build` e `npm run lint` passam.
- [x] O endpoint/rota valida acesso à subconta no servidor (RLS + checagem); **não** vaza dados de outra subconta.

### Manuais
- [ ] Gerar o PDF de um mês produz um arquivo legível com os 3 blocos, 50‑30‑20 e saldo corretos (batendo com a tela mensal).
- [ ] O arquivo abre/baixa e pode ser enviado (tamanho razoável; sem dependência de browser headless).
- [ ] (Se aplicável) diagnóstico da anamnese exportado.

## 7. Fora de escopo
- Envio automático por WhatsApp/email (manual no MVP — o gestor baixa e envia). Templates customizáveis pelo usuário.
