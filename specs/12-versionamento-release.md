# Spec 12 — Versionamento, commits e procedimento de release · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para implantar/auditar o processo desta feature.

## 0. Leitura obrigatória antes de codar
- `noviq-app/docs/organizacao-versionamento-commits.md` — **fonte de verdade** deste processo.
- `noviq-app/CHANGELOG.md` e `noviq-app/package.json` (estado atual do versionamento).
- `CLAUDE.md` §6 (Commits e versionamento).

## 1. Pré-requisitos
- [ ] Repositório `noviq-app` é um repo Git válido, conectado a `reezolver/NoviQ_Finance`.
- [ ] `CHANGELOG.md` existe no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) (já existe).
- [ ] `package.json` tem o campo `"version"` (já está em `0.1.0`).

## 2. Objetivo
Tornar o processo de **versionamento (SemVer)**, **commits semânticos (Conventional Commits)** e
**fechamento de versão** descrito no doc em algo **repetível e à prova de esquecimento**, sem
adicionar dependências nem complexidade (coerente com a postura "MVP solo" do doc).

Esta spec é **processo + artefatos leves**: um template de mensagem de commit, um procedimento de
release reutilizável e a garantia de que a tag da versão atual existe. **Não** instala husky,
commitlint nem qualquer automação que bloqueie commits.

## 3. Tarefa

### 3.1 Template de mensagem de commit (`.gitmessage`) — NOVO
Crie `noviq-app/.gitmessage` com um lembrete dos tipos Conventional Commits (em português),
para servir de guia ao redigir mensagens:

```
# tipo: descrição curta no presente (sem ponto final)
#
# Tipos: feat (nova funcionalidade) · fix (bug) · docs · style ·
#        refactor · chore · test   | use tipo! para quebra de compatibilidade
#
# (linha em branco)
# Corpo opcional: o porquê da mudança, se não for óbvio.
```

Aponte o Git para ele (uma vez, no repo):
```bash
git config commit.template .gitmessage
```
> Não bloqueia nada — só pré-preenche o editor de commit. Documente este `git config` no doc da §3.4.

### 3.2 Procedimento de release reutilizável — esta seção É o procedimento
Sempre que for **fechar uma versão** `vX.Y.Z`, executar **na ordem** e **num único commit de release**:

1. Decidir o número por SemVer: `feat` → sobe **MENOR**; `fix` → sobe **CORRECAO**; `feat!`/quebra → sobe **MAIOR**.
2. `package.json`: atualizar `"version"` para `X.Y.Z`.
3. `CHANGELOG.md`:
   - Mover o conteúdo de `## [Não lançado]` para uma nova seção `## [X.Y.Z] - AAAA-MM-DD`.
   - Deixar `## [Não lançado]` vazio (com a nota "nada ainda").
   - Atualizar os links de comparação no rodapé (`[Não lançado]: …/compare/vX.Y.Z...HEAD` e `[X.Y.Z]: …/releases/tag/vX.Y.Z`).
4. Commit único: `chore(release): vX.Y.Z`.
5. Criar a tag anotada: `git tag -a vX.Y.Z -m "vX.Y.Z"`.
6. Publicar: `git push origin main --follow-tags` (Vercel faz o deploy do push na `main` automaticamente).

> Lucas não precisa decorar: basta pedir ao Claude *"fecha a versão X.Y.Z"* e ele segue estes passos.

### 3.3 Garantir a tag da versão atual (`v0.1.0`)
O `CHANGELOG.md` já referencia `v0.1.0`, mas a tag pode não existir no Git. Verificar e, se faltar, criar:
```bash
git tag -l v0.1.0          # se vazio:
git tag -a v0.1.0 -m "v0.1.0" <commit-da-release-0.1.0>
git push origin v0.1.0
```
> Se não houver um commit claramente identificável como o da release 0.1.0, usar o `HEAD` atual e registrar isso na descrição da release no GitHub.

### 3.4 Documentar o `git config` no doc
No `docs/organizacao-versionamento-commits.md`, na §2 ("Como subir de versão") ou na §3, adicionar
uma nota curta de que o repo usa `git config commit.template .gitmessage` e que o procedimento de
release canônico está nesta spec (`specs/12-versionamento-release.md`). **Não** reescrever o doc —
apenas adicionar o ponteiro.

## 4. Arquivos a criar / tocar
- `noviq-app/.gitmessage` (NOVO)
- `noviq-app/docs/organizacao-versionamento-commits.md` (ponteiro p/ esta spec + nota do template)
- `noviq-app/specs/README.md` (linha no índice e no checklist de conclusão)
- (sem mudanças em código de aplicação; sem novas dependências em `package.json`)

## 5. Contratos relevantes
- **SemVer** `MAIOR.MENOR.CORRECAO`; prefixo `0.` = desenvolvimento inicial (MVP). Vira `1.0.0` ao ir para clientes reais.
- **Conventional Commits**: `tipo: descrição` (português, presente). `feat`/`fix`/`docs`/`style`/`refactor`/`chore`/`test`; `!` para quebra.
- **Keep a Changelog**: versão mais nova no topo; seções `Adicionado`/`Modificado`/`Corrigido`/`Removido`.
- **Três pontos de verdade da versão andam juntos**: `package.json` ↔ `CHANGELOG.md` ↔ tag `vX.Y.Z`.

## 6. Critérios de aceite

### Automáticos
- [ ] `noviq-app/.gitmessage` existe e `git config --get commit.template` retorna `.gitmessage`.
- [ ] `git tag -l v0.1.0` retorna `v0.1.0` (tag existe local e no remoto: `git ls-remote --tags origin v0.1.0`).
- [ ] `node -p "require('./package.json').version"` é igual à versão mais recente do topo de `CHANGELOG.md`.
- [ ] `npm run build` continua passando (esta spec não toca código de app).

### Manuais
- [ ] Pedir ao Claude *"fecha a versão 0.2.0"* num teste mental: ele segue os 6 passos da §3.2 sem inventar etapas.
- [ ] Ao abrir um commit novo, o editor mostra o template comentado (`.gitmessage`).
- [ ] O doc `organizacao-versionamento-commits.md` aponta para esta spec como procedimento canônico.

## 7. Fora de escopo
- Husky, commitlint ou qualquer hook que **bloqueie** commits/PRs (o doc desaconselha p/ MVP solo).
- Branches e Pull Requests (trabalho segue direto na `main`, conforme §4 do doc).
- Scripts de release automatizados (`standard-version`, `release-please`, etc.).
- Reescrita do doc `organizacao-versionamento-commits.md` — apenas adicionar ponteiro/nota.
