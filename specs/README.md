# Specs — MVP Noviq Finance

Specs **por feature**, escritas como **prompts executáveis de handoff**: você cola um arquivo
inteiro no Claude Code (VS Code) e ele constrói aquela feature, do schema à tela, com critérios
de aceite. Derivam da fonte de verdade:

- `noviq-app/prompts/spec-mvp-noviq-2026-06-20.md` — spec-mestre (visão geral, referência)
- `noviq-app/prompts/pesquisa-arquitetura-mvp-2026-06-20.md` — pesquisa (o "porquê")
- `noviq-app/specs/_contexto-base.md` — **leia antes de qualquer spec abaixo**

## Como usar

1. Abra o Claude Code no repositório `noviq-app`.
2. Escolha a próxima feature na ordem de dependência (tabela abaixo).
3. Cole o conteúdo do `.md` correspondente como mensagem inicial.
4. Ao terminar, confira os **critérios de aceite** (automáticos + manuais) antes de seguir.

## Ordem de dependência

| Ordem | Spec | Feature | Depende de |
|---|---|---|---|
| 1 | [`00-fundacao-schema-rls.md`](00-fundacao-schema-rls.md) | Schema completo + RLS + funções + seed master | — |
| 2 | [`01-acesso-admin-logins.md`](01-acesso-admin-logins.md) | `supabase-admin`, criar login de cliente, auto-cadastro + aprovação de educador | 00 |
| 3 | [`02-roteamento-workspace.md`](02-roteamento-workspace.md) | `middleware`, route group `(workspace)/[subcontaId]`, dashboards de entrada | 00, 01 |
| 4 | [`03-controle-anual.md`](03-controle-anual.md) | Controle Anual (1ª tela do cliente) | 00–02 |
| 5 | [`04-controle-mensal.md`](04-controle-mensal.md) | Controle Mensal (3 blocos + 50‑30‑20 + gráfico) | 00–02 |
| 6 | [`05-lancamento-modal.md`](05-lancamento-modal.md) | Modal de lançamento (baixo atrito) | 00–02, 04 |
| 7 | [`06-objetivos.md`](06-objetivos.md) | Objetivos (meta, progresso, necessário/mês) | 00–02, 05 |
| 8 | [`07-painel-gestao-seletor-subconta.md`](07-painel-gestao-seletor-subconta.md) | Painel educador/master + seletor de subconta + mover cliente | 00–03 |
| 9 | [`08-anamnese.md`](08-anamnese.md) | Anamnese: link público → submissão → diagnóstico → converter em subconta | 00–02, 07 |
| 10 | [`09-investimentos-patrimonio.md`](09-investimentos-patrimonio.md) | Investimentos/Patrimônio + reserva de emergência + PL | 00–04 |
| 11 | [`10-renda-futura.md`](10-renda-futura.md) | Renda Futura (juros compostos / aposentadoria) | 00–02 |
| 12 | [`11-export-pdf.md`](11-export-pdf.md) | Exportar PDF (extrato do mês / diagnóstico) | 04, 08 |
| 13 | [`12-versionamento-release.md`](12-versionamento-release.md) | Versionamento, commits semânticos e procedimento de release (processo) | — |

> **Specs 00–02 são pré-requisito de tudo.** As telas (03+) podem ser feitas em paralelo
> entre si depois que a fundação estiver de pé, respeitando as dependências da tabela.

## Estado de conclusão (atualize ao concluir)

- [ ] 00 — Schema + RLS
- [ ] 01 — Acesso / admin / logins
- [ ] 02 — Roteamento / workspace
- [ ] 03 — Controle Anual
- [ ] 04 — Controle Mensal
- [ ] 05 — Lançamento
- [ ] 06 — Objetivos
- [ ] 07 — Painel de gestão
- [ ] 08 — Anamnese
- [ ] 09 — Investimentos/Patrimônio
- [ ] 10 — Renda Futura
- [ ] 11 — Export PDF
- [x] 12 — Versionamento / release
