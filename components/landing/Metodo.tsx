import { Target, Zap, BarChart3 } from 'lucide-react'

const PASSOS = [
  {
    num: 1,
    icon: Target,
    titulo: 'Planeje',
    texto: (
      <>
        Defina quanto pretende ganhar e gastar no mês. O Noviq sugere a divisão{' '}
        <strong>50-30-20</strong>: 50% em despesas fixas, 30% em variáveis, 20% investido.
      </>
    ),
  },
  {
    num: 2,
    icon: Zap,
    titulo: 'Lance',
    texto: (
      <>
        Registre receitas e despesas em segundos, num lançamento rápido. Categorias do seu
        jeito (mercado, lazer, transporte…).
      </>
    ),
  },
  {
    num: 3,
    icon: BarChart3,
    titulo: 'Acompanhe',
    texto: (
      <>
        Veja na hora a <strong>diferença</strong> entre o planejado e o realizado — verde
        quando sobra, vermelho quando estoura. Sem surpresa no fim do mês.
      </>
    ),
  },
]

export function Metodo() {
  return (
    <section id="como-funciona" className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Um método simples, que cabe na sua rotina
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PASSOS.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.num} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">{p.num}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold">{p.titulo}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.texto}</p>
            </div>
          )
        })}
      </div>

      <p className="mt-12 text-center text-muted-foreground italic">
        Planejado × Realizado × Diferença. É só isso que você precisa olhar pra ter controle.
      </p>
    </section>
  )
}
