import { MockAnual } from '@/components/landing/mocks/MockAnual'
import { MockMensal } from '@/components/landing/mocks/MockMensal'
import { MockLancamento } from '@/components/landing/mocks/MockLancamento'
import { MockObjetivos } from '@/components/landing/mocks/MockObjetivos'

interface ItemVitrineProps {
  titulo: string
  subtexto: string
  url: string
  children: React.ReactNode
}

function ItemVitrine({ titulo, subtexto, url, children }: ItemVitrineProps) {
  return (
    <div className="flex flex-col gap-3 min-w-[280px] md:min-w-0">
      <div className="rounded-xl border border-border shadow-lg overflow-hidden bg-card">
        <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/40 shrink-0" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/40 shrink-0" />
          <div className="w-2.5 h-2.5 rounded-full bg-success/40 shrink-0" />
          <span className="ml-2 text-[10px] text-muted-foreground truncate">{url}</span>
        </div>
        <div className="p-3">{children}</div>
      </div>
      <div>
        <p className="font-semibold text-sm">{titulo}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtexto}</p>
      </div>
    </div>
  )
}

function PlaceholderTela({ titulo, subtexto, url }: { titulo: string; subtexto: string; url: string }) {
  return (
    <div className="flex flex-col gap-3 min-w-[280px] md:min-w-0">
      <div className="rounded-xl border border-border shadow-lg overflow-hidden bg-card">
        <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/40 shrink-0" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/40 shrink-0" />
          <div className="w-2.5 h-2.5 rounded-full bg-success/40 shrink-0" />
          <span className="ml-2 text-[10px] text-muted-foreground truncate">{url}</span>
        </div>
        <div className="p-3">
          <div className="aspect-[16/10] border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Prévia em breve</span>
            {/* TODO: Lucas grava print real ou cria MockAnamnese */}
          </div>
        </div>
      </div>
      <div>
        <p className="font-semibold text-sm">{titulo}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtexto}</p>
      </div>
    </div>
  )
}

export function VitrineTelas() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Veja o Noviq por dentro</h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible xl:grid-cols-3">
          <ItemVitrine
            titulo="Controle Anual"
            subtexto="Janeiro a dezembro num panorama só: o que você planejou, o que realizou e a diferença, mês a mês."
            url="noviqfinance.com.br/anual"
          >
            <MockAnual />
          </ItemVitrine>

          <ItemVitrine
            titulo="Controle Mensal"
            subtexto="O mês detalhado com gráfico em destaque e o resumo 50-30-20 — prático como um app, claro como uma planilha."
            url="noviqfinance.com.br/mensal"
          >
            <MockMensal />
          </ItemVitrine>

          <ItemVitrine
            titulo="Lançamento rápido"
            subtexto="Registre uma despesa ou receita em segundos, sem sair do fluxo."
            url="noviqfinance.com.br/lancamento"
          >
            <MockLancamento />
          </ItemVitrine>

          <ItemVitrine
            titulo="Objetivos"
            subtexto="Acompanhe cada meta com valor alvo, prazo e progresso."
            url="noviqfinance.com.br/objetivos"
          >
            <MockObjetivos />
          </ItemVitrine>

          <PlaceholderTela
            titulo="Anamnese (educador)"
            subtexto="O retrato financeiro completo do cliente, pronto antes da reunião."
            url="noviqfinance.com.br/anamnese"
          />
        </div>
      </div>
    </section>
  )
}
