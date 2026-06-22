# Noviq Finance

SaaS web de **organização financeira pessoal** que traz a clareza de uma planilha
(modelo **planejado × realizado × diferença**, distribuição **50‑30‑20**) para dentro de
um app moderno. Usado pelo **cliente final** (organiza as próprias finanças) e pelo
**educador financeiro** (acompanha a carteira de clientes e lança no lugar deles quando
preciso).

**Stack:** Next.js 16 (App Router) · TypeScript · Shadcn/ui + Tailwind CSS · Supabase · Vercel.

> Versão atual: **0.1.0** — primeiro MVP (ver [CHANGELOG.md](CHANGELOG.md)).

---

## Como rodar localmente

Pré-requisito: Node.js 20+.

```bash
npm install        # instala as dependências (1ª vez)
npm run dev        # sobe o servidor de desenvolvimento em http://localhost:3000
```

Outros comandos:

```bash
npm run build      # build de produção
npm run start      # roda o build de produção localmente
npm run lint       # checa o código com ESLint
```

As variáveis de ambiente ficam em `.env.local` (não versionado). É preciso ter as chaves
do Supabase configuradas.

---

## Estrutura do projeto

```
app/                 Páginas e rotas (Next.js App Router)
  (auth)/            Login e fluxos de autenticação
  (workspace)/       Área logada por subconta — [subcontaId]/...
  styleguide/        🎨 Design system (NÃO alterar sem necessidade)
  api/               Rotas de API (anamnese, export)
  actions/           Server Actions
components/          Componentes de UI por feature (+ components/ui base Shadcn)
lib/                 Lógica e integrações (cálculos, Supabase, auth)
types/               Tipos TypeScript
supabase/migrations/ Migrations do banco
specs/               Specs do MVP (uma por feature) — ver specs/README.md
prompts/             Contexto de produto e prompts reutilizáveis
docs/                Documentação do projeto (organização, versionamento, commits)
_arquivo-v1/         Versão 1 arquivada (mantida só localmente, fora do Git)
```

---

## Serviços conectados (nuvem)

| Serviço     | Para quê                                  | Referência                                  |
|-------------|-------------------------------------------|---------------------------------------------|
| **GitHub**  | Repositório / histórico / versões         | `reezolver/NoviQ_Finance`                   |
| **Vercel**  | Deploy automático a cada push na `main`    | projeto `novi-q-finance`                     |
| **Supabase**| Banco de dados + autenticação             | conectado via MCP no Claude Code             |

O deploy é **automático**: todo `git push` para a branch `main` dispara um novo deploy no Vercel.

---

## Convenções (como contribuir)

Este projeto segue padrões de mercado para manter tudo organizado:

- **Commits:** [Conventional Commits](docs/organizacao-versionamento-commits.md)
- **Versões:** [Semantic Versioning](docs/organizacao-versionamento-commits.md)
- **Histórico de versões:** [CHANGELOG.md](CHANGELOG.md)

📖 Guia completo (em português, passo a passo): **[docs/organizacao-versionamento-commits.md](docs/organizacao-versionamento-commits.md)**
