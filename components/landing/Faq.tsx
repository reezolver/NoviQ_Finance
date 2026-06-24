const PERGUNTAS = [
  {
    pergunta: 'Preciso pagar para usar?',
    resposta:
      'Não. O Noviq está em fase beta e é gratuito por enquanto. Quando houver planos, você será avisado antes.',
  },
  {
    pergunta: 'Funciona como a minha planilha?',
    resposta:
      'Funciona com o mesmo método — planejado, realizado e diferença, com a divisão 50-30-20 — mas sem fórmulas pra manter. O app cuida das contas.',
  },
  {
    pergunta: 'Meus dados ficam seguros?',
    resposta:
      'Seus dados são protegidos e visíveis só para você (e para o seu educador, se você tiver um). Cada conta enxerga apenas o que é dela.',
  },
  {
    pergunta: 'Sou educador financeiro. Dá pra usar com meus clientes?',
    resposta:
      'Sim. Você acompanha sua carteira, faz a anamnese e lança pelo cliente quando precisar.',
  },
  {
    pergunta: 'Em quais aparelhos funciona?',
    resposta: 'No navegador, no computador e no celular. É só entrar e usar.',
  },
  {
    pergunta: 'Como começo?',
    resposta:
      'Clique em "Criar conta grátis", responda uma pergunta rápida e comece a organizar.',
  },
]

export function Faq() {
  return (
    <section id="perguntas" className="bg-muted/40 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Perguntas frequentes</h2>
        </div>

        <div className="flex flex-col gap-2">
          {PERGUNTAS.map((item) => (
            <details
              key={item.pergunta}
              className="group rounded-xl border border-border bg-card overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 font-medium text-sm list-none select-none hover:bg-muted/50 transition-colors">
                {item.pergunta}
                <span className="text-muted-foreground text-lg leading-none transition-transform group-open:rotate-45 shrink-0">
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border">
                {item.resposta}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
