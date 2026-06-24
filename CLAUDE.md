# CLAUDE.md — Noviq Finance

> Lido automaticamente a cada sessão. **Nunca delete nem mova este arquivo.**

A **Noviq Finance** é uma plataforma web de educação e controle financeiro pessoal.
**Stack:** Next.js (App Router) · Shadcn/ui · Tailwind CSS · TypeScript · Supabase · Vercel.

---

## 1. CONEXÃO COM O SUPABASE

Este projeto está **conectado ao Supabase via MCP**. Sempre que uma ação precisar do
banco de dados, **use essa conexão real** — não invente schema nem dados.

Com a conexão você pode, entre outras coisas:
- Inspecionar o banco: listar tabelas, colunas e relações
- Rodar SQL e aplicar migrations
- Gerar os tipos TypeScript a partir do schema real
- Ler logs e checar configurações do projeto

Antes de codar algo que toca dados, **consulte o Supabase** para trabalhar em cima da
estrutura que existe de verdade.

---

## 2. DESIGN SYSTEM — REGRAS ABSOLUTAS

O design system já está **100% construído em `/app/styleguide/`**.
**Nunca crie componentes visuais do zero.** Sempre siga esta ordem:

1. **Primeiro:** verificar se o componente já existe em `/app/styleguide/components/`
2. **Segundo:** se não existir, combinar componentes Shadcn já instalados
3. **Terceiro:** só como último recurso, criar algo novo — sempre usando as
   CSS variables do `globals.css`

### Tokens de identidade visual
- **Cor primária:** `#008CFF` → usar via `bg-primary`, `text-primary`
- **Fonte:** DM Sans → já instalada no `layout.tsx`
- **Tema:** financeiro, confiável, limpo e moderno

### Regras de cor
- **Nunca** usar cores hardcoded — sempre CSS variables (`bg-primary`, `text-destructive`, etc.)
- Verde (`text-success`) → valores positivos / saldo favorável
- Vermelho (`text-destructive`) → valores negativos / alertas
- Primário (`#008CFF`) → ações principais, destaques, CTAs

---

## 3. DARK MODE + LIGHT MODE — SEMPRE OS DOIS

O design tem **modo claro e modo escuro**. Tudo que for criado **deve funcionar nos
dois modos**.
- Sempre usar as CSS variables / tokens do design system (que já se adaptam ao tema),
  nunca cores fixas
- Quando precisar de ajuste específico, usar as variantes `dark:` do Tailwind
- Ao finalizar qualquer tela ou componente, validar visualmente nos dois modos

---

## 4. SERVIÇOS CONECTADOS NA NUVEM

Este SaaS está conectado a três serviços externos. Ao construir qualquer coisa, use a
conexão **real** — não invente dados, schema, URLs nem configuração.

| Serviço | Papel | Como usar |
|---------|-------|-----------|
| **Supabase** | Banco de dados + autenticação | Conectado via **MCP** (ver seção 1). Consulte o schema real antes de codar dados. |
| **GitHub** (`reezolver/NoviQ_Finance`) | Repositório, histórico e versões | Commits semânticos, `push` na `main`, tags e releases (ver seção 6). |
| **Vercel** (`novi-q-finance`) | Deploy do site | **Deploy automático** a cada `push` na branch `main`. Conferir build/logs pelo MCP do Vercel quando algo der errado no ar. |

> Fluxo: implementar → commit semântico → `push main` → Vercel faz deploy automático.

---

## 5. ORGANIZAÇÃO DE ARQUIVOS

Arquivo novo entra **na pasta do assunto dele**. Não criar arquivos soltos na raiz.

- Tela / rota → `app/` (auth em `(auth)/`, área logada em `(workspace)/[subcontaId]/`)
- Peça de tela reaproveitável → `components/` (base Shadcn em `components/ui/`)
- Cálculo, conexão, fórmula → `lib/`
- Tipos TypeScript → `types/`
- Mudança no banco → `supabase/migrations/`

O repositório `noviq-app/` guarda **só o app** (código + config). Os materiais de
**planejamento** e **documentação** vivem **fora do repo**, na pasta-mãe `../_planejamento/`:
- Documentação → `../_planejamento/docs/`
- Specs de feature → `../_planejamento/specs/` · contexto de produto → `../_planejamento/prompts/`

> Esses materiais são **só locais** (fora do Git e do deploy). São referência — eu
> (Claude) leio e atualizo lá; não recriar `docs/`/`specs/`/`prompts/` dentro do repo.

O **design system** (`app/styleguide/`) é **preservado** — não recriar nem apagar.
A **v1 arquivada** está em `../_arquivo/v1/` (também fora do repo, só local).

---

## 6. COMMITS E VERSIONAMENTO

Seguir os padrões documentados em **`../_planejamento/docs/organizacao-versionamento-commits.md`** (fora do repo).

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) —
  `feat:` (funcionalidade), `fix:` (bug), `docs:`, `chore:`, `refactor:`, etc.
  Mensagem curta, em português, no presente.
- **Versões:** [SemVer](https://semver.org/lang/pt-BR/) — `MAIOR.MENOR.CORRECAO`.
  `feat` sobe o MENOR; `fix` sobe o CORRECAO; quebra de compatibilidade (`feat!`) sobe o MAIOR.
- **SEMPRE conferir a versão atual antes de mexer nela.** Quando for solicitado um
  commit de release, bump de versão ou qualquer coisa que dependa do número da versão,
  primeiro **leia a versão real** (campo `version` do `package.json`; confirmar com a
  última tag `git tag` / topo do `CHANGELOG.md`) e **incremente em cima dela** — nunca
  assumir ou chutar o número.
- **Ao fechar uma versão:** atualizar **juntos** `package.json` (campo `version`),
  `CHANGELOG.md` (nova seção) e criar a **tag** `vX.Y.Z`, depois `push --tags`.
