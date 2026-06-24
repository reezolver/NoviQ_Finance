# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
versionamento segue o [Semantic Versioning](https://semver.org/lang/pt-BR/).

> Como ler: a versão **mais nova fica no topo**. Cada versão lista o que foi
> `Adicionado`, `Modificado`, `Corrigido` ou `Removido`.

## [Não lançado]

- (nada ainda — as próximas mudanças entram aqui antes de virarem uma versão)

## [0.10.0] - 2026-06-24

### Adicionado

- **Dashboard de gestão ("Visão geral"):** o painel master deixa de empilhar
  tudo numa página e ganha um dashboard de métricas — usuários (total, novos
  7/30 dias, ativos nos últimos 30 dias), clientes (ligados a você, de outros
  gestores, pool, lixeira) e anamneses (enviadas/preenchidas/convertidas + taxa
  de conversão), com gráfico de novos usuários por mês. Educador vê uma versão
  reduzida da própria operação.
- **Painel de Educadores (master):** lista todos os gestores com a contagem de
  clientes e permite **promover um educador a master** ou **excluí-lo** (os
  clientes dele caem no pool "Não atribuídos").
- **Avatar no topo:** a foto de perfil real passa a aparecer também no canto
  superior direito (menu do usuário), além do rodapé da sidebar.

### Modificado

- **Painel de gestão dividido em abas próprias na sidebar:** Clientes,
  Educadores, Leads e Anamneses viram rotas separadas sob `/painel/*`, com itens
  de navegação conforme o papel (Educadores e Leads só para master).
- **Clientes separados por origem:** a aba Clientes do master distingue
  "ligados a você" de "de outros gestores".
- **Anamneses — visão master:** o master passa a ver **todas** as anamneses da
  plataforma (com a coluna "Gestor") e pode excluí-las (nova policy de RLS).
- **Foto de perfil salva em um passo:** o upload acontece ao escolher a imagem
  (antes exigia um segundo clique em "Salvar foto", o que fazia a foto "não
  ficar").

## [0.9.0] - 2026-06-23

### Modificado

- **Reserva de emergência por custo de vida essencial:** a meta da reserva
  deixa de ser estimada por 6× a despesa média realizada (que misturava luxo
  com essencial) e passa a ser **6× o custo de vida essencial** informado
  **manualmente** na tela de Investimentos. Campo vazio = sem meta. Um
  mini-texto orienta o que conta (moradia, alimentação, transporte essencial,
  contas básicas) e o que não conta (lazer, restaurantes, supérfluos).

## [0.8.0] - 2026-06-23

### Adicionado

- **Planejado editável no Controle Mensal:** o educador define/edita o valor
  planejado de cada categoria direto no mês, pelo botão **Editar planejado**.
  Por padrão a edição vale **só para aquele mês**; um checkbox **"Aplicar a
  todos os meses (recorrente)"** torna o valor o padrão dos meses sem ajuste.
- **Aporte de objetivo com grupo (Fixa/Variável):** ao lançar um aporte em um
  objetivo, agora se escolhe se ele conta como gasto **Fixo** ou **Variável**.
  O aporte passa a **aparecer no mês** — no bloco do grupo (como "Aporte:
  \<objetivo\>"), no detalhamento, no resumo 50‑30‑20 e no % da renda — e a
  reduzir o saldo do mês.
- **Saldo inicial da conta:** controle discreto no Controle Mensal para definir
  o saldo de partida da conta (aceita valor negativo).

### Modificado

- **"Saldo Realizado" → "Saldo em conta" (acumulado):** o saldo do mês agora é
  **acumulado** (saldo inicial + tudo que entrou e saiu até o fim do mês), para
  bater com o extrato bancário. No Controle Anual, cada mês mostra o saldo em
  conta acumulado ao fim daquele mês, e o resumo do topo usa o valor de
  dezembro. O **Saldo Planejado** segue por mês; a **Diferença** não muda. O PDF
  do mês reflete o mesmo "Saldo em conta" da tela.

## [0.7.3] - 2026-06-23

### Corrigido

- **Envio da anamnese sem login:** qualquer pessoa com o link público da
  anamnese agora consegue preencher e enviar, mesmo sem estar logada. O envio
  (`POST /api/anamnese/[token]`) estava sendo barrado pelo middleware e
  redirecionado para o login, causando erro em guia anônima. A gravação segue
  protegida (token válido, link de uso único e consentimento LGPD).

## [0.7.2] - 2026-06-23

### Adicionado

- **Exportar anamnese em PDF:** depois que o cliente preenche a anamnese, o
  educador pode baixar um PDF com as **respostas** dele (dados pessoais,
  dependentes, renda, despesas fixas/variáveis, investimento, patrimônio,
  dívidas, objetivos e observações). Botão **PDF** na lista de anamneses do
  painel, ao lado do diagnóstico. Geração 100% no servidor com acesso validado
  por RLS — nenhum dado sensível trafega pelo cliente.

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

[Não lançado]: https://github.com/reezolver/NoviQ_Finance/compare/v0.7.2...HEAD
[0.7.2]: https://github.com/reezolver/NoviQ_Finance/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/reezolver/NoviQ_Finance/compare/v0.6.0...v0.7.1
[0.6.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/reezolver/NoviQ_Finance/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/reezolver/NoviQ_Finance/releases/tag/v0.1.0
