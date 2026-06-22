# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
versionamento segue o [Semantic Versioning](https://semver.org/lang/pt-BR/).

> Como ler: a versão **mais nova fica no topo**. Cada versão lista o que foi
> `Adicionado`, `Modificado`, `Corrigido` ou `Removido`.

## [Não lançado]

- (nada ainda — as próximas mudanças entram aqui antes de virarem uma versão)

## [0.2.0] - 2026-06-22

### Adicionado

- **Navegação por abas no workspace:** barra com as 5 seções (Anual, Mensal,
  Investimentos, Objetivos, Renda Futura) fixa abaixo do cabeçalho, preservando
  a subconta ativa ao trocar de seção e com destaque da seção atual. Antes,
  Investimentos, Objetivos e Renda Futura só eram alcançáveis pela URL.

## [0.1.0] - 2026-06-22

Primeiro MVP da Noviq Finance — fundação completa e telas principais do cliente e do educador.

### Adicionado

- **Fundação:** schema do banco + RLS (default-deny), funções e seed master (Specs 00–02).
- **Acesso e logins:** cadastro/aprovação de educador, criação de login de cliente, `supabase-admin`.
- **Roteamento por workspace:** route group `(workspace)/[subcontaId]` e middleware de sessão.
- **Controle Anual:** panorama Jan–Dez (planejado × realizado × diferença) — primeira tela do cliente.
- **Controle Mensal:** blocos de Renda, Despesa Fixa e Despesa Variável com resumo 50‑30‑20 e gráfico.
- **Lançamento rápido:** modal de baixo atrito (Despesa / Receita / Objetivo).
- **Objetivos:** metas com progresso e valor necessário por mês.
- **Painel de gestão:** painel do educador/master com seletor de subconta (impersonação).
- **Anamnese:** link público → submissão → diagnóstico financeiro.
- **Investimentos / Patrimônio** e **Renda Futura** (juros compostos / aposentadoria).
- **Exportar PDF:** extrato do mês / diagnóstico em PDF.
- **Design system** completo em `app/styleguide/` (tema claro e escuro, cor primária `#008CFF`).

[Não lançado]: https://github.com/reezolver/NoviQ_Finance/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/reezolver/NoviQ_Finance/releases/tag/v0.1.0
