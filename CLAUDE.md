# CLAUDE.md — Noviq Finance Platform

> Este arquivo é lido automaticamente pelo Claude Code a cada sessão.
> Nunca delete ou mova este arquivo. Ele é o cérebro do projeto.

---

## 1. O QUE É ESSE PROJETO

A **Noviq Finance** é uma plataforma web de educação e controle financeiro pessoal.
O Thiago (cliente) é um educador financeiro que hoje usa uma planilha Excel para
gerenciar as finanças dos seus clientes. Nosso trabalho é transformar essa planilha
em uma plataforma web moderna, bonita e fácil de usar.

**Dois tipos de usuário:**
- **Cliente (usuário final)** → acessa suas próprias finanças
- **Educador Financeiro (admin)** → acessa o painel com todos os clientes e pode
  entrar na conta de cada um como se fosse o próprio cliente (impersonação)

---

## 2. STACK TECNOLÓGICA

- **Framework:** Next.js 16.2.6 (App Router)
- **Componentes:** Shadcn/ui
- **Estilização:** Tailwind CSS
- **Linguagem:** TypeScript (tipagem estrita — nunca use `any`)
- **Banco de dados:** Supabase
- **Deploy:** Vercel
- **Repositório:** GitHub

---

## 3. DESIGN SYSTEM — REGRAS ABSOLUTAS

O design system já está 100% construído em `/app/styleguide/`.
**Nunca crie componentes visuais do zero.** Sempre siga essa ordem:

1. **Primeiro:** verificar se o componente já existe em `/app/styleguide/components/`
2. **Segundo:** se não existir, combinar componentes Shadcn já instalados para criar
3. **Terceiro:** só como último recurso, criar algo novo — mas sempre usando as
   CSS variables do `globals.css`

### Tokens de identidade visual
- **Cor primária:** `#008CFF` → usar via `bg-primary`, `text-primary`
- **Fonte:** DM Sans → já instalada no `layout.tsx`
- **Tema:** financeiro, confiável, limpo e moderno

### Componentes já instalados e documentados
- `Button` (variantes: Primary, Secondary, Outline, Ghost, Destructive, Link)
- `Badge` (Primary, Secondary, Outline, Destructive, Ghost)
- `Alert` (info, warning)
- `Card` (com variantes financeiras)
- `Input` (default, disabled, error)
- `Radio Group`

### Regra de cores em contexto financeiro
- **Verde** (`text-success`, `bg-success`) → valores positivos, saldo favorável
- **Vermelho** (`text-destructive`, `bg-destructive`) → valores negativos, alertas
- **Primário** (`#008CFF`) → ações principais, destaques, CTAs

---

## 4. REGRAS DE NEGÓCIO DA PLANILHA

A planilha tem 16 abas: Controle Anual + 12 meses (Jan–Dez) + Investimento +
Renda Futura + Objetivo. Cada tela do sistema replica uma dessas abas.

---

### REGRA 1 — Controle Anual

Exibe uma visão consolidada do ano inteiro.

```
Colunas: Mês | Planejado | Realizado | Diferença
Linhas: Janeiro até Dezembro
```

- **Diferença** = Realizado − Planejado (pode ser negativa)
- Diferença negativa → exibir em vermelho
- Diferença positiva → exibir em verde
- Os valores de cada mês são puxados automaticamente do Controle Mensal
- Cada mês na tabela é clicável → navega para o Controle Mensal daquele mês

---

### REGRA 2 — Controle Mensal

Cada mês tem **3 blocos lado a lado**, cada um com 3 colunas:
`Planejado | Realizado | Diferença`

**Bloco 1 — Renda:**
- Salário
- Investimentos (rendimento recebido)
- Outras fontes (linhas extras configuráveis)
- **Total da Renda**

**Bloco 2 — Despesas Fixas:**
- Aluguel, Internet, Gás, Seguro
- Investimento (aporte mensal — fica dentro das fixas)
- **Total das Fixas**

**Bloco 3 — Despesas Variáveis:**
- Lazer, Transporte, Alimentação, Uber
- Categorias personalizáveis por cliente
- **Total das Variáveis**

**Cálculos do Saldo Final:**
```
Saldo Planejado = Renda Planejada − Fixas Planejadas − Variáveis Planejadas
Saldo Realizado = Renda Realizada − Fixas Realizadas − Variáveis Realizadas
```

**Resumo 50-30-20 (rodapé do mês):**
Exibe 3 linhas: Planejado / Realizado / Ideal

```
Ideal = 50% Fixo | 30% Variável | 20% Investimento
(calculado sobre a Renda Total)
```

---

### REGRA 3 — Objetivos

```
Colunas: Objetivo | Valor Alvo | Data de Conclusão | Valor Acumulado | Progresso % | Necessário/Mês
```

**Fórmulas:**
```
Progresso % = Valor Acumulado ÷ Valor Alvo × 100
Valor Necessário Mensal = (Valor Alvo − Valor Acumulado) ÷ Meses restantes
```

**Exemplo real:**
- Casamento: alvo R$ 40.000 | acumulado R$ 5.714 | progresso 14,28% | necessário R$ 6.666/mês

**Regra importante:** ao registrar um lançamento do tipo "Objetivo" vinculado a uma
meta, o Valor Acumulado dessa meta deve ser incrementado automaticamente.

---

### REGRA 4 — Investimentos

```
Colunas: Tipo | Instituição | Categoria | Valor Aplicado | Rentabilidade | Finalidade
```

**Tipos:** Renda Fixa | Multimercado | Renda Variável
**Finalidade:** Reserva | Patrimônio (totais exibidos separados)

**Exemplo real:**
- CDB 102% | XP | Renda Fixa | R$ 2.000 | R$ 100 | Reserva

---

### REGRA 5 — Renda Futura (Aposentadoria)

**Parâmetros de entrada:**
- Aporte Inicial
- Aporte Mensal
- Taxa Média Anual (%)
- Idade Atual

**Saída:** projeção ano a ano com patrimônio acumulado por idade

**Fórmula:** juros compostos com aportes mensais recorrentes

**Exemplo real:**
- 24 anos | R$ 600/mês | taxa 10% a.a. → R$ 870.678 aos 50 anos → renda passiva R$ 5.000/mês

---

## 5. ESPECIFICAÇÃO DAS TELAS

### TELA 1 — Login (`/login`)

**Objetivo:** autenticação com redirecionamento por perfil

**Elementos:**
- Logo Noviq centralizado
- Campo e-mail + campo senha
- Botão "Entrar" (primary, full width)
- Link "Esqueci minha senha"

**Comportamento:**
- Perfil cliente → redireciona para `/controle-anual`
- Perfil educador → redireciona para `/painel`
- Erro inline se credenciais inválidas
- Loading state no botão durante autenticação
- Layout centralizado, fundo com cor `bg-background`

---

### TELA 2 — Controle Anual (`/controle-anual`)

**Objetivo:** visão consolidada do ano com gráfico e tabela

**Elementos:**
- Header: nome do usuário + seletor de ano (setas anterior/próximo)
- Gráfico de barras agrupadas: Planejado (azul) / Realizado (verde) / Diferença (cinza)
- Tabela abaixo: 12 linhas (meses) × 4 colunas (Mês, Planejado, Realizado, Diferença)

**Comportamento:**
- Diferença negativa → vermelho
- Diferença positiva → verde
- Mês atual destacado no gráfico
- Clicar em qualquer mês → navega para `/controle-mensal?mes=X`
- Usar componente `chart` (bar chart) do design system

---

### TELA 3 — Controle Mensal (`/controle-mensal`)

**Objetivo:** detalhe do mês com 3 blocos e resumo 50-30-20

**Elementos:**
- Navegação entre meses (setas anterior/próximo)
- 3 blocos lado a lado (grid 3 colunas): Renda / Fixas / Variáveis
- Cada bloco: tabela com colunas Planejado / Realizado / Diferença
- Rodapé: resumo 50-30-20 com 3 linhas (Planejado / Realizado / Ideal)
- Saldo Final Planejado e Realizado em destaque abaixo dos blocos

**Comportamento:**
- Diferença = Realizado − Planejado
- Linha Ideal sempre fixa: 50% Fixo | 30% Variável | 20% Investimento
- Categorias de Variáveis são personalizáveis por cliente
- Botão flutuante "+" para abrir o modal de Lançamento

---

### TELA 4 — Lançamento (modal/drawer)

**Objetivo:** registrar uma transação em menos de 10 segundos

**Elementos:**
- Modal ou Drawer (não página inteira)
- Campo: Tipo → Receita | Despesa Fixa | Despesa Variável | Objetivo
- Campo: Categoria (muda conforme o Tipo)
- Campo: Valor (R$)
- Campo: Data (pré-preenchida com hoje)
- Campo: Descrição (opcional)
- Botões: "Salvar" (primary) e "Cancelar" (outline)

**Comportamento:**
- Foco automático no campo Tipo ao abrir
- Ao selecionar Tipo = Objetivo → exibir dropdown com as metas cadastradas
- Após salvar → fechar modal e atualizar totais da tela atual sem reload
- Validação: valor obrigatório, categoria obrigatória

---

### TELA 5 — Objetivos (`/objetivos`)

**Objetivo:** visualizar e acompanhar metas financeiras

**Elementos:**
- Grid de cards, um por objetivo
- Cada card: nome do objetivo, valor alvo, data de conclusão
- Barra de progresso (componente `progress` do design system)
- Valor acumulado e valor necessário/mês em destaque
- Botão "Novo objetivo" no header

**Comportamento:**
- Progresso % calculado em tempo real
- Valor necessário/mês recalculado automaticamente
- Ao lançar aporte vinculado → card atualiza o valor acumulado

---

### TELA 6 — Painel do Educador (`/painel`) — acesso restrito

**Objetivo:** educador visualiza e acessa a conta de qualquer cliente

**Elementos:**
- Header com "Painel do Educador"
- Campo de busca por nome do cliente
- Lista/tabela de clientes: nome | último acesso | status
- Botão "Acessar" por cliente

**Comportamento:**
- Clicar em "Acessar" → entra em modo impersonação
- Header global muda para: "Visualizando conta de [Nome]"
- Botão "Voltar ao painel" sempre visível durante impersonação
- Ao voltar → retorna ao painel sem perder estado

---

## 6. ORDEM DE DESENVOLVIMENTO

Desenvolver nessa sequência (cada tela depende da anterior):

1. `/login` — autenticação base com Supabase
2. `/controle-anual` — tela inicial pós-login
3. `/controle-mensal` — detalhe por mês
4. Modal de Lançamento — aparece em múltiplas telas
5. `/objetivos` — cards com progresso
6. `/painel` — exclusivo do educador

---

## 7. BOAS PRÁTICAS DE CÓDIGO — OBRIGATÓRIAS

### TypeScript
- Sempre usar tipagem explícita
- Nunca usar `any` — use `unknown` e faça type narrowing se necessário
- Criar interfaces/types em `/types/` para entidades do domínio (ex: `Transaction`, `Goal`, `User`)

### Componentes
- Máximo 150 linhas por componente — se passar, quebrar em subcomponentes
- Sempre tratar 3 estados: loading, error, empty
- Nomenclatura: PascalCase para componentes, camelCase para funções e variáveis
- Comentários em português, código em inglês

### Organização de pastas
```
app/
  (auth)/login/
  (dashboard)/
    controle-anual/
    controle-mensal/
    objetivos/
    painel/
components/
  ui/          # componentes Shadcn (não editar)
  shared/      # componentes reutilizáveis do projeto
  [tela]/      # componentes específicos de cada tela
types/         # interfaces TypeScript do domínio
lib/           # funções utilitárias e helpers
  calculations.ts  # TODAS as fórmulas financeiras aqui
hooks/         # custom hooks
```

### Fórmulas financeiras
- **Todas as fórmulas financeiras ficam em `/lib/calculations.ts`**
- Nunca escrever cálculo inline no componente
- Sempre tipar entrada e saída das funções de cálculo

### Reutilização
- Se um trecho de código aparece 2x → virar função em `/lib/`
- Se um componente visual aparece 2x → virar componente em `/components/shared/`

---

## 8. COMO SE COMPORTAR DURANTE O DESENVOLVIMENTO

### Sempre fazer antes de codar:
1. Ler este CLAUDE.md
2. Verificar o design system em `/app/styleguide/` para entender os componentes disponíveis
3. Confirmar qual tela está sendo desenvolvida e suas regras neste arquivo

### Perguntar ao usuário quando:
- Algo no pedido contradiz uma regra definida neste arquivo
- Existir mais de uma forma válida de implementar e a escolha impactar outras telas
- Uma funcionalidade não estiver especificada aqui e for necessária para o desenvolvimento
- Estiver prestes a criar um componente novo e não tiver certeza se já existe no design system

### Formato de resposta durante desenvolvimento:
- Antes de codar: confirmar o que vai ser feito em 2-3 linhas
- Durante: explicar brevemente cada decisão relevante
- Após: listar o que foi feito e o que falta para aquela tela

### Nunca:
- Criar componentes visuais do zero sem verificar o design system antes
- Usar cores hardcoded — sempre usar CSS variables (`bg-primary`, `text-destructive`, etc.)
- Escrever fórmulas financeiras dentro de componentes
- Fazer mais de uma coisa por vez sem confirmar com o usuário

---

## 9. CONTEXTO DO PROJETO PARA RETOMADA

Quando iniciar uma nova sessão, leia este arquivo e confirme:
> "Li o CLAUDE.md. Estou trabalhando na plataforma Noviq Finance.
> Design system em `/app/styleguide/`. Próxima tarefa: [perguntar ao usuário].
> Pode começar."