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
