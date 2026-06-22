# Guia de Organização, Versionamento e Commits — Noviq Finance

> **Para quem é este documento:** Lucas (orquestrador do projeto, não-desenvolvedor) e
> qualquer pessoa/IA que vá mexer no repositório. Explica, em português e passo a passo,
> **como manter o projeto organizado e profissional** ao longo do tempo.
>
> Resultado da pesquisa de boas práticas de mercado. Baseado em **3 padrões oficiais e
> estáveis** da indústria de software:
> - [Conventional Commits 1.0.0](https://www.conventionalcommits.org/pt-br/v1.0.0/)
> - [Semantic Versioning 2.0.0 (SemVer)](https://semver.org/lang/pt-BR/)
> - [Keep a Changelog 1.1.0](https://keepachangelog.com/pt-BR/1.1.0/)

---

## 1. Como o projeto está organizado

O projeto de verdade vive na pasta do repositório Git. Tudo que importa para o GitHub e o
Vercel está **dentro do repositório** — arquivos soltos fora dele ficam só no seu computador.

```
app/                 Páginas e rotas do site
  (auth)/            Login
  (workspace)/       Área logada (cada cliente é um [subcontaId])
  styleguide/        🎨 DESIGN SYSTEM — não mexer sem necessidade
  api/  actions/     Back-end (rotas de API e Server Actions)
components/          Peças de tela reaproveitáveis
lib/                 Cálculos e conexões (Supabase, auth, fórmulas)
types/               Tipos TypeScript
supabase/migrations/ Mudanças no banco de dados
specs/               O "o quê fazer" de cada feature
prompts/             Contexto de produto para colar no Claude
docs/                Documentação (este arquivo mora aqui)
_arquivo-v1/         Versão antiga arquivada (fica só local, fora do GitHub)
```

**Regra de ouro:** arquivo novo entra na pasta do assunto dele. Tela → `app/`. Peça de
tela → `components/`. Cálculo/conexão → `lib/`. Documento → `docs/`.

---

## 2. Versionamento semântico (SemVer) — o número da versão

A versão tem **três números**: `MAIOR.MENOR.CORRECAO` (ex.: `0.1.0`).

| Parte | Quando aumenta | Exemplo |
|-------|----------------|---------|
| **MAIOR** | Mudança que **quebra** o que existia (incompatível) | `1.0.0` → `2.0.0` |
| **MENOR** | **Nova funcionalidade** que não quebra nada | `0.1.0` → `0.2.0` |
| **CORRECAO** | **Correção de bug** pequena, sem novidade | `0.1.0` → `0.1.1` |

Estamos na **`0.1.0`**. O `0.` na frente significa "ainda em desenvolvimento inicial" —
normal para um MVP. Quando o produto estiver maduro e no ar para clientes de verdade, vira
**`1.0.0`**.

**Onde a versão fica registrada:**
1. No arquivo `package.json` (campo `"version"`).
2. Numa **tag** do Git (ex.: `v0.1.0`) — um "carimbo" naquele ponto da história.
3. No `CHANGELOG.md` (a lista do que mudou em cada versão).

### Como subir de versão (peça pro Claude fazer)

Quando quiser fechar uma nova versão, é só pedir algo assim no Claude Code:

> "Subir a versão para 0.2.0: atualiza o `package.json`, adiciona a seção no
> `CHANGELOG.md` com o que mudou, faz o commit `chore(release): v0.2.0`, cria a tag
> `v0.2.0` e envia tudo pro GitHub."

---

## 3. Commits semânticos (Conventional Commits) — a mensagem de cada salvamento

Um **commit** é um "salvar com etiqueta" no histórico. A mensagem segue este formato:

```
tipo: descrição curta no presente

(opcional) explicação mais longa, se precisar
```

### Tipos principais

| Tipo | Use quando… | Reflete na versão |
|------|-------------|-------------------|
| `feat` | adicionou uma **funcionalidade nova** | sobe o **MENOR** |
| `fix` | **corrigiu um bug** | sobe o **CORRECAO** |
| `docs` | mexeu só em **documentação** | — |
| `style` | formatação/visual sem mudar lógica | — |
| `refactor` | reorganizou código sem mudar comportamento | — |
| `chore` | tarefa de manutenção (deps, config, release) | — |
| `test` | adicionou/ajustou testes | — |

### Exemplos bons (já é o padrão que você vinha usando!)

```
feat: exportação de PDF do extrato mensal
fix: corrige cálculo da diferença quando a renda é zero
docs: adiciona guia de versionamento
chore(release): v0.2.0
```

### Mudança que quebra compatibilidade (raro)

Adicione `!` depois do tipo. Isso sinaliza que a versão **MAIOR** deve subir:

```
feat!: muda o formato das categorias (contas antigas precisam migrar)
```

**Você não precisa decorar nada disso.** Ao pedir uma mudança no Claude, é só dizer:
*"faça o commit seguindo Conventional Commits"* — ele monta a mensagem certa.

---

## 4. O fluxo completo (do zero ao deploy)

1. Você pede uma mudança ao Claude Code (cola o prompt/spec).
2. Claude implementa, testa e faz **um ou mais commits** semânticos.
3. Claude faz `git push` para a branch `main`.
4. O **Vercel** detecta o push e faz o **deploy automático** (site no ar atualizado).
5. Quando juntar mudanças suficientes para uma "entrega", fecha uma **versão** (seção 2).

> Hoje o trabalho é direto na `main` (projeto solo, simples). Se um dia entrar mais gente,
> o próximo passo profissional é usar **branches + Pull Requests** — mas isso é opcional
> agora e não vale a complexidade para um MVP de uma pessoa só.

---

## 5. Serviços conectados

| Serviço | Papel | Como o Claude usa |
|---------|-------|-------------------|
| **GitHub** (`reezolver/NoviQ_Finance`) | Guarda o código e o histórico | commits, push, tags, releases |
| **Vercel** (`novi-q-finance`) | Coloca o site no ar | deploy automático a cada push na `main` |
| **Supabase** | Banco de dados + login | conectado via **MCP** — Claude lê/altera o banco de verdade |

---

## 6. Checklist para manter o repositório "bonito"

- [ ] Cada commit tem mensagem no padrão `tipo: descrição`.
- [ ] Funcionalidade nova = `feat`; bug = `fix`.
- [ ] Ao fechar uma versão: `package.json` + `CHANGELOG.md` + tag `vX.Y.Z` atualizados juntos.
- [ ] Arquivo novo na pasta certa (seção 1).
- [ ] Nada de senha/chave commitado (fica em `.env.local`, que é ignorado pelo Git).
- [ ] O design system (`app/styleguide/`) é preservado — não recriar componentes do zero.
