import {
  CalendarDays,
  LayoutDashboard,
  Plus,
  Target,
  TrendingUp,
  Clock,
  Users,
  ClipboardList,
  FileDown,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const CLIENTE = [
  {
    icon: CalendarDays,
    titulo: 'Controle Anual',
    beneficio: 'O ano inteiro numa tela. Veja mês a mês quanto entrou, quanto saiu e onde seu dinheiro foi.',
  },
  {
    icon: LayoutDashboard,
    titulo: 'Controle Mensal',
    beneficio: 'Sua tela do dia a dia. Renda, despesa fixa e variável, com gráfico e o resumo 50-30-20 sempre à vista.',
  },
  {
    icon: Plus,
    titulo: 'Lançamento rápido',
    beneficio: 'Registrou, pronto. Tipo, categoria, valor e data já preenchida com hoje. Sem fricção.',
  },
  {
    icon: Target,
    titulo: 'Objetivos',
    beneficio: 'Casamento, viagem, reserva. Defina a meta e o prazo — o Noviq mostra quanto guardar por mês.',
  },
  {
    icon: TrendingUp,
    titulo: 'Investimentos',
    plus: true,
    beneficio: 'Sua carteira organizada por tipo e finalidade, da reserva de emergência ao patrimônio de longo prazo.',
  },
  {
    icon: Clock,
    titulo: 'Renda Futura',
    plus: true,
    beneficio: 'Quanto guardar hoje para a renda que você quer no futuro. Juros compostos trabalhando a seu favor.',
  },
]

const EDUCADOR = [
  {
    icon: Users,
    titulo: 'Painel de clientes',
    beneficio: 'Acompanhe toda a sua carteira num lugar só e entre na conta do cliente para lançar por ele quando precisar.',
  },
  {
    icon: ClipboardList,
    titulo: 'Anamnese financeira',
    beneficio: 'Envie um formulário e receba o panorama completo do cliente antes mesmo da reunião.',
  },
  {
    icon: FileDown,
    titulo: 'Exportar PDF',
    beneficio: 'Gere um extrato organizado e mande pro cliente no WhatsApp em um clique.',
  },
]

export function Funcionalidades() {
  return (
    <section id="funcionalidades" className="bg-muted/40 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tudo o que você precisa — e nada que você não usa
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLIENTE.map((f) => {
            const Icon = f.icon
            return (
              <Card key={f.titulo}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className="size-5 text-primary" />
                    <CardTitle className="flex items-center gap-2">
                      {f.titulo}
                      {f.plus && (
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          plus
                        </span>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.beneficio}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-12">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Para educadores financeiros
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EDUCADOR.map((f) => {
              const Icon = f.icon
              return (
                <Card key={f.titulo} className="opacity-90">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="size-5 text-primary" />
                      <CardTitle>{f.titulo}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{f.beneficio}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
