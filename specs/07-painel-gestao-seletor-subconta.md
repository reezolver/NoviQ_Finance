# Spec 07 — Painel de gestão + seletor de subconta · handoff executável

> Cole este arquivo inteiro no Claude Code (VS Code) para construir esta feature.

## 0. Leitura obrigatória antes de codar
- `meu-projeto/specs/_contexto-base.md` (§5 Login×Subconta — a regra de acesso é o coração desta tela)
- `meu-projeto/prompts/spec-mvp-noviq-2026-06-20.md` §10.5 e §9
- `app/actions/subcontas.ts` (Spec 01 — `criarSubconta`, `criarLoginCliente`, `moverCliente`)
- `app/styleguide/components/dropdown-menu`, `table`, `dialog`

## 1. Pré-requisitos
- [ ] **Specs 00–03** (schema, acesso, roteamento, e pelo menos o Controle Anual para "entrar" no cliente).

## 2. Objetivo
Construir a porta de entrada do **gestor** (educador/master): **lista da carteira de clientes** +
**seletor de subconta** (a UX "trocar de conta estilo Instagram", que é **contexto de workspace,
não troca de sessão**). Master vê clientes de qualquer educador e pode **mover** cliente entre
gestores; educador vê só a própria carteira; **ninguém vê a subconta `pessoal` de outro educador**.

## 3. Tarefa
- Rota: `app/painel/page.tsx` (Server Component) — dashboard de gestão.
- **Lista de clientes:** `table` com as `subcontas` acessíveis (`tipo='cliente'`), nome, gestor (para master), e botão **"Entrar"** → `Link` para `/[subcontaId]/controle-anual`.
  - A RLS já filtra o que cada gestor enxerga; **não** reimplemente a regra no front, apenas exiba o resultado.
- **Onboarding vazio:** se não há clientes, mostrar CTA "Criar conta de cliente" + "Enviar anamnese" (anamnese = Spec 08).
- **Criar cliente:** modal → `criarSubconta('cliente', nome, ownerEmail)` + `criarLoginCliente` (Spec 01).
- **Seletor de subconta** (`components/workspace/SeletorSubconta.tsx`): `dropdown-menu` no header do workspace listando as subcontas acessíveis (a pessoal do gestor + clientes); selecionar navega para `/[subcontaId]/...`. Integra com o `WorkspaceHeader` do Spec 02.
- **Master — mover cliente:** ação `moverCliente(subcontaId, novoGestorId)` (`update subcontas set gestor_id`); só master; UI num menu por linha. Cliente nunca fica órfão (validar `novoGestorId`).
- **Conta pessoal do gestor:** botão para acessar/criar a própria subconta `pessoal` (`criarSubconta('pessoal', ...)` se ainda não existe).

## 4. Regras de acesso (não negociáveis)
- Educador: vê suas subcontas `cliente` + sua `pessoal`. **Não** vê `pessoal` nem clientes de outro educador.
- Master: vê todas as subcontas `cliente` (qualquer educador) + a própria `pessoal`. **Não** vê `pessoal` de educador (privacidade — garantido pela RLS do Spec 00).
- Escrita é sempre da subconta; quem lançou fica em `created_by_user_id`.

## 5. Arquivos a criar / tocar
- `app/painel/page.tsx`
- `components/workspace/SeletorSubconta.tsx` (NOVO)
- `components/painel/*` (lista, modal criar cliente, menu mover) — via design system
- `app/actions/subcontas.ts` (completar `moverCliente` se ficou stub no Spec 01)

## 6. Critérios de aceite

### Automáticos
- [x] `npm run build` e `npm run lint` passam.
- [x] `moverCliente` valida papel master no servidor; sem `any`.

### Manuais
- [ ] Educador vê só a própria carteira; abrir `/[subcontaId]` de cliente alheio → negado.
- [ ] Educador **não** vê a subconta `pessoal` de outro educador em lugar nenhum.
- [ ] Master vê clientes de qualquer educador e **move** um cliente entre educadores (gestor muda; cliente continua acessível).
- [ ] Seletor de subconta troca o contexto **sem** novo login; ao "entrar" no cliente, lançar registra `created_by_user_id` = o gestor (auditoria).
- [ ] **dark + light**; estado vazio com onboarding.

## 7. Fora de escopo
- Anamnese (Spec 08). Métricas/relatórios agregados da carteira. Realm separado para venda a outros educadores (fora do MVP).
