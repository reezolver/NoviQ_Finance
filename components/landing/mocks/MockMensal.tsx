const DADOS_MES = {
  renda: { planejado: 12000, realizado: 11500 },
  fixas: { planejado: 5000, realizado: 4850 },
  variaveis: { planejado: 3000, realizado: 3420 },
  investimentos: { planejado: 2000, realizado: 1800 },
  saldo: { planejado: 2000, realizado: 1430 },
}

const DISTRIBUICAO = [
  { label: 'Fixas', pct: 42, color: 'bg-primary' },
  { label: 'Variáveis', pct: 30, color: 'bg-chart-2' },
  { label: 'Investimentos', pct: 16, color: 'bg-chart-3' },
]

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function diff(planejado: number, realizado: number) {
  return realizado - planejado
}

export function MockMensal() {
  const linhas = [
    { label: 'Renda', ...DADOS_MES.renda, positivo: true },
    { label: 'Despesas fixas', ...DADOS_MES.fixas, positivo: false },
    { label: 'Despesas variáveis', ...DADOS_MES.variaveis, positivo: false },
    { label: 'Investimentos', ...DADOS_MES.investimentos, positivo: false },
  ]

  return (
    <div className="w-full flex flex-col gap-3 p-1">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Jun / 2026</p>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1 px-1 font-medium text-muted-foreground"></th>
            <th className="text-right py-1 px-1 font-medium text-muted-foreground">Plan.</th>
            <th className="text-right py-1 px-1 font-medium text-muted-foreground">Real.</th>
            <th className="text-right py-1 px-1 font-medium text-muted-foreground">Dif.</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            const d = diff(l.planejado, l.realizado)
            const bom = l.positivo ? d >= 0 : d <= 0
            return (
              <tr key={l.label} className="border-b border-border/50">
                <td className="py-1 px-1 font-medium">{l.label}</td>
                <td className="py-1 px-1 text-right text-muted-foreground">{fmt(l.planejado)}</td>
                <td className="py-1 px-1 text-right">{fmt(l.realizado)}</td>
                <td className={`py-1 px-1 text-right font-semibold ${bom ? 'text-success' : 'text-destructive'}`}>
                  {d >= 0 ? '+' : ''}{fmt(d)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-1">
        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Distribuição do mês</p>
        <div className="space-y-1.5">
          {DISTRIBUICAO.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="text-[10px] w-16 text-muted-foreground shrink-0">{d.label}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-[10px] font-medium w-7 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
