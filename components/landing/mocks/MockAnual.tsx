const MESES = [
  { mes: 'Jan', planejado: 8500, realizado: 7890, diferenca: 610 },
  { mes: 'Fev', planejado: 8500, realizado: 9120, diferenca: -620 },
  { mes: 'Mar', planejado: 8500, realizado: 8210, diferenca: 290 },
  { mes: 'Abr', planejado: 8500, realizado: 7650, diferenca: 850 },
  { mes: 'Mai', planejado: 8500, realizado: 8890, diferenca: -390 },
  { mes: 'Jun', planejado: 8500, realizado: 8100, diferenca: 400 },
  { mes: 'Jul', planejado: 8500, realizado: 0, diferenca: 0 },
  { mes: 'Ago', planejado: 8500, realizado: 0, diferenca: 0 },
  { mes: 'Set', planejado: 8500, realizado: 0, diferenca: 0 },
  { mes: 'Out', planejado: 8500, realizado: 0, diferenca: 0 },
  { mes: 'Nov', planejado: 8500, realizado: 0, diferenca: 0 },
  { mes: 'Dez', planejado: 8500, realizado: 0, diferenca: 0 },
]

function fmt(v: number) {
  if (v === 0) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export function MockAnual() {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Mês</th>
            <th className="text-right py-1.5 px-2 font-medium text-muted-foreground">Planejado</th>
            <th className="text-right py-1.5 px-2 font-medium text-muted-foreground">Realizado</th>
            <th className="text-right py-1.5 px-2 font-medium text-muted-foreground">Diferença</th>
          </tr>
        </thead>
        <tbody>
          {MESES.map((m, i) => (
            <tr
              key={m.mes}
              className={`border-b border-border/50 ${i === 5 ? 'bg-primary/10' : 'hover:bg-muted/40'}`}
            >
              <td className="py-1.5 px-2 font-medium">{m.mes}</td>
              <td className="py-1.5 px-2 text-right text-muted-foreground">{fmt(m.planejado)}</td>
              <td className="py-1.5 px-2 text-right">{fmt(m.realizado)}</td>
              <td className={`py-1.5 px-2 text-right font-medium ${
                m.diferenca > 0 ? 'text-success' : m.diferenca < 0 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {m.diferenca !== 0 ? fmt(m.diferenca) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
