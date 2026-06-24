import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const OBJETIVOS = [
  { nome: 'Reserva de emergência', meta: 30000, atual: 18500, prazo: 'Dez/2026' },
  { nome: 'Viagem para Europa', meta: 15000, atual: 4200, prazo: 'Jun/2027' },
  { nome: 'Notebook novo', meta: 8000, atual: 8000, prazo: 'Concluído' },
]

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export function MockObjetivos() {
  return (
    <div className="w-full flex flex-col gap-3 p-1">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Meus objetivos</p>
      {OBJETIVOS.map((obj) => {
        const pct = Math.min(100, Math.round((obj.atual / obj.meta) * 100))
        const concluido = obj.prazo === 'Concluído'
        return (
          <div key={obj.nome} className="flex flex-col gap-1.5 p-2 rounded-lg bg-card ring-1 ring-border/60">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium leading-tight">{obj.nome}</span>
              {concluido ? (
                <Badge variant="outline" className="text-success border-success/40 text-[10px] shrink-0">Concluído</Badge>
              ) : (
                <span className="text-[10px] text-muted-foreground shrink-0">{obj.prazo}</span>
              )}
            </div>
            <Progress value={pct} className={`h-1.5 ${concluido ? '[&>div]:bg-success' : ''}`} />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className={concluido ? 'text-success font-medium' : ''}>{fmt(obj.atual)}</span>
              <span>{fmt(obj.meta)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
