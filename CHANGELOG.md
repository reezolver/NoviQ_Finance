# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
versionamento segue o [Semantic Versioning](https://semver.org/lang/pt-BR/).

> Como ler: a versão **mais nova fica no topo**. Cada versão lista o que foi
> `Adicionado`, `Modificado`, `Corrigido` ou `Removido`.

## [Não lançado]

- (nada ainda — as próximas mudanças entram aqui antes de virarem uma versão)

## [0.7.1] - 2026-06-23

### Adicionado

- **Sidebar unificada de navegação:** uma moldura única (sidebar + topbar)
  envolve workspace e painel, com **account switcher** no topo (trocar de
  carteira sem trocar de sessão) e **menu do usuário** no rodapé. A sidebar
  colapsa para ícones (atalho `Ctrl/Cmd+B`) e vira drawer no mobile.
- **Renomear conta/carteira:** o nome da carteira (`subcontas.nome`) passa a ser
  editável pelo switcher, desacoplado do nome do usuário — fim do "Master".
- **Exclusão de cliente com lixeira:** remoção **temporária** (recuperável por
  90 dias, login suspenso) ou **permanente**, mais o **pool de não atribuídos**
  para o master reatribuir clientes órfãos e uma rotina de purga automática.
- **Página de Conta (`/conta`):** abas **Perfil · Segurança · Conta ·
  Preferências** — editar nome e **foto de perfil** (avatar), trocar **senha** e
  **e-mail** com reautenticação, ajustar **tema** e **excluir a própria conta**
  (temporária ou permanente). Acessível pelo menu do usuário, que agora mostra
  avatar + nome.

### Corrigido

- **Seletor de contas levava a 404 fora do workspace:** ao escolher uma conta
  estando em `/conta` ou `/painel`, o switcher navegava para uma rota sem página
  índice ("Página não encontrada"). Agora abre a conta escolhida na seção padrão
  (Controle Anual).

## [0.6.0] - 2026-06-22

### Adicionado

- **Opção de sair da conta:** ícone de usuário no cabeçalho (workspace e painel)
  abre um menu com nome, e-mail e o botão **Sair**. Ao clicar, desloga via
  `supabase.auth.signOut()` e redireciona para `/login` com reload completo
  (garante que o cookie limpo chegue ao servidor antes de qualquer roteamento).

## [0.5.0] - 2026-06-22

### Modificado

- **"Voltar ao painel" agora à esquerda:** o atalho saiu do canto direito para o
  início do cabeçalho do workspace, seguindo a convenção de "voltar".

### Adicionado

- **Atalho "Painel de gestão" no seletor de subconta:** o dropdown do workspace
  passa a oferecer, no topo (separado das contas), um atalho para o painel —
  deixando claro que selecionar o nome da conta pessoal **entra na conta
  pessoal**, e voltar ao painel é outra ação. Vale para educador e master, que
  agora veem o dropdown mesmo sem clientes cadastrados.

## [0.4.0] - 2026-06-22

### Adicionado

- **Atalho "Voltar ao painel" no workspace:** botão no cabeçalho que leva o
  gestor (educador/master) de volta ao painel de gestão. Aparece apenas para
  gestor — cliente não tem painel — e mostra só o ícone no mobile.

## [0.3.0] - 2026-06-22

### Adicionado

- **Feedback de carregamento (skeletons):** ao entrar numa carteira e ao trocar
  de seção no workspace, cada tela mostra um skeleton fiel ao seu layout
  (Controle Anual, Mensal, Investimentos, Objetivos, Renda Futura) e o `/painel`
  exibe um skeleton de tabela — sem mais a sensação de "tela travada".
- **Indicador de transição nas abas:** a aba clicada no menu do workspace mostra
  um ponto pulsante enquanto a navegação carrega (`useLinkStatus`), sem
  dependência extra.
- **Telas de erro próprias:** boundaries amigáveis com "Tentar novamente" e rota
  de retorno (global, do workspace e do painel), incluindo o boundary de último
  recurso (`global-error`). Detalhes técnicos só vão para o console.
- **Telas de 404 próprias:** página de rota inexistente e a de carteira "não
  encontrada ou sem acesso" (com retorno por papel: gestor → painel, cliente →
  sua conta), substituindo o 404 cru do Next.

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

[Não lançado]: https://github.com/reezolver/NoviQ_Finance/compare/v0.7.1...HEAD
[0.7.1]: https://github.com/reezolver/NoviQ_Finance/compare/v0.6.0...v0.7.1
[0.6.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/reezolver/NoviQ_Finance/releases/tag/v0.1.0
