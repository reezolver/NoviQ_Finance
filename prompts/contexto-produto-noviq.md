# Contexto do produto — Noviq Finance

> Bloco de contexto reutilizável. Cole isto (inteiro ou a seção relevante) antes de
> "Preciso implementar [tal coisa]. Quero que você pesquise..." para o Claude Code ter
> contexto preciso do produto. Fonte: reunião com o cliente Thiago + estrutura atual do app.

---

## Versão curta (para colar rápido)

Noviq Finance é um SaaS web de **organização financeira pessoal** que traz a clareza e a
simplicidade de uma planilha (modelo **planejado × realizado × diferença**, distribuição
**50-30-20**) para dentro de um app moderno. É usado pelo **cliente final** (que organiza as
próprias finanças e faz lançamentos) e pelo **educador financeiro** (que acompanha sua carteira
de clientes e lança no lugar deles quando preciso). Substitui a planilha Excel do educador e o
Upify (caro e completo demais). Princípios: **prático, simples e objetivo** — uma visão financeira
clara em poucas telas. Stack: Next.js 16 (App Router), TypeScript, Shadcn/ui + Tailwind, Supabase,
Vercel.

---

## Posicionamento (o problema)

- O educador (Thiago) hoje usa o **Upify** (caro, vendido só para educadores) e/ou uma **planilha** própria.
- Vários clientes abandonaram o Upify e voltaram para a planilha por ser **mais simples e clara**.
- Apps do mercado financeiro são enxutos/confusos demais; o Upify é completo **demais** (cansativo de usar).
- Proposta da Noviq: o melhor dos dois — a **simplicidade da planilha** + a **praticidade de um app**.
- A planilha do Thiago já codifica o **método de trabalho dele**. O produto deve modelar esse método —
  **não copiar o Upify**. (A planilha é a fonte de verdade dos cálculos.)

## Público

- **Foco do MVP: o CLIENTE FINAL** — pessoa física (muitas vezes PJ/PF misturado: donos de empresa com
  finanças pessoais e da empresa juntas), renda mais alta, que quer organizar a vida financeira de forma simples.
- O **educador financeiro** também usa: acompanha a carteira de clientes e, quando o cliente não tem tempo,
  lança no lugar dele.
- **Estratégia de fases:** começar pela ferramenta do **cliente** (mais rápida de entregar e agrega valor à
  consultoria do educador — diferencial competitivo). Vender a ferramenta para **outros educadores** é fase
  posterior (realm separado para o cliente não se confundir).

## Perfis de acesso (3 níveis)

1. **Master** — equipe dona do produto; vê tudo, inclusive funções em desenvolvimento.
2. **Educador financeiro** — gerencia a própria carteira de clientes; consegue **"entrar" na conta de um
   cliente** (troca de conta estilo Instagram / impersonação) e lançar por ele.
3. **Cliente** — vê o próprio painel e faz seus lançamentos.

O painel do cliente é exatamente o mesmo que o educador visualiza ao entrar na conta dele.

## Princípio central (o método)

- Tudo gira em torno de **Planejado × Realizado × Diferença**.
- Distribuição padrão **50-30-20** sobre a renda (50% despesa fixa, 30% despesa variável, 20% investimento).
- Usar **linguagem direta**: "Despesa fixa / Despesa variável / Investimento" — **NÃO** "Necessidade / Desejo / Investimentos".
- **Categorias personalizáveis** pelo cliente (lazer, mercado, transporte, Uber, etc.).
- Diferença em verde (positivo) / vermelho (negativo).

## Telas / módulos do MVP (ordem de prioridade do cliente)

1. **Controle Anual** — PRIMEIRA tela ao logar. Panorama Jan–Dez (planejado, realizado, diferença).
   Mais visual/"cheia", só de visualização. Clicar num mês abre o mês e mostra o **% que cada categoria
   consumiu da renda**.
2. **Controle Mensal** — a tela mais prática e rápida. 3 blocos: **Renda, Despesa Fixa, Despesa Variável**,
   cada um com Planejado/Realizado/Diferença. Layout com **gráfico em destaque** (estilo app, NÃO réplica
   de planilha), navegação por meses ao lado, detalhamento por categoria embaixo, resumo 50-30-20.
3. **Lançamento (modal)** — rápido e simples (reduzir atrito; o do Upify é cansativo). Campos: **Tipo**
   (Despesa / Receita / Objetivo), **Categoria**, **Valor**, **Data** (pré-preenchida com hoje),
   **Descrição/Observação opcionais**. Tipo "Objetivo" vincula à tela de Objetivos.
4. **Objetivos** — cliente cadastra meta (ex.: Casamento, R$ 50.000, até uma data). Mostra valor alvo,
   data, valor acumulado, **valor necessário/mês**, progresso. Lançamento do tipo Objetivo **abate
   automaticamente** da meta.
5. **Investimentos** — visão da carteira: categoria (renda fixa / variável / multimercado), finalidade
   (reserva de emergência / patrimônio), distribuição. **Secundária / "plus"** — discreta por padrão
   (clientes vão de leigos a avançados). Parceria com Gustavo (assessor XP).
6. **Renda Futura (aposentadoria)** — cálculo de juros compostos: quanto poupar hoje para atingir uma
   renda passiva X.
7. **Painel do Educador/Admin** — lista de todos os clientes da carteira; entra no cliente (impersonação)
   e lança por ele.
8. **Anamnese / Ficha financeira** (prioritário — Thiago está saindo do Upify) — formulário enviado ao
   cliente; ele preenche manualmente; o educador recebe o **panorama financeiro completo ANTES da reunião
   de fechamento**. Gerenciar fichas / respostas recebidas / detalhes. Visível só no perfil educador/admin.
9. **Exportar PDF** (desejável) — gerar um "extrato"/relatório dos lançamentos em PDF para enviar ao
   cliente no WhatsApp.

## Conceito de UX — "menu avançado"

Visão padrão **mínima** (cliente que só quer acompanhar). Um toggle **"avançado"** (estilo Photoshop
Essencial/Avançado) revela mais funções para quem quer gerenciar a fundo. Manter o mínimo na cara do usuário.

## Fora do escopo do MVP (futuro — não implementar agora)

- **"Meu Assessor"**: IA no WhatsApp (texto/áudio/foto) que cria lançamentos automaticamente; depende de
  API paga (custo de créditos) → modelo de assinatura para cobrir o custo.
- Vender a ferramenta para **outros educadores** (realm separado).
- **Geração automática de contrato**.
- Lógica de **fatura/ciclo do cartão de crédito** (Upify tem; complexo demais para agora — manter simples).

## Stack / técnico

- **Next.js 16** (App Router), **TypeScript** estrito (sem `any`), **Shadcn/ui + Tailwind**,
  **Supabase** (auth + DB), deploy **Vercel**.
- Fórmulas financeiras centralizadas em `lib/calculations.ts` (planejado/realizado/diferença, 50-30-20,
  progresso de objetivo, juros compostos). A planilha do Thiago é a referência dos cálculos.
