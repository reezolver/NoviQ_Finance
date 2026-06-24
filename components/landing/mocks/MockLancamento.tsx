const LANCAMENTO = {
  tipo: 'Despesa',
  categoria: 'Mercado',
  grupo: 'Variável',
  valor: 'R$ 347,90',
  data: '24/06/2026',
  descricao: 'Compras da semana',
}

function CampoMock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      <div className="h-7 rounded-md border border-border bg-muted/50 px-2 flex items-center text-xs text-foreground">
        {value}
      </div>
    </div>
  )
}

export function MockLancamento() {
  return (
    <div className="w-full p-1 flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold">Novo lançamento</p>
        <p className="text-[11px] text-muted-foreground">Registre uma despesa ou receita</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CampoMock label="Tipo" value={LANCAMENTO.tipo} />
        <CampoMock label="Grupo" value={LANCAMENTO.grupo} />
        <CampoMock label="Categoria" value={LANCAMENTO.categoria} />
        <CampoMock label="Valor" value={LANCAMENTO.valor} />
        <CampoMock label="Data" value={LANCAMENTO.data} />
        <CampoMock label="Descrição" value={LANCAMENTO.descricao} />
      </div>

      <div className="flex gap-2 pt-1">
        <div className="flex-1 h-8 rounded-md border border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
          Cancelar
        </div>
        <div className="flex-1 h-8 rounded-md bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
          Salvar
        </div>
      </div>
    </div>
  )
}
