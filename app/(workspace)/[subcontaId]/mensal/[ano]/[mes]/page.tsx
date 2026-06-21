import { TelaPlaceholder } from '@/components/workspace/TelaPlaceholder'

/**
 * Controle Mensal — a tela mais prática (Renda, Despesa Fixa, Despesa Variável
 * + resumo 50-30-20). Conteúdo real no Spec 04. O segmento recebe `ano`/`mes`.
 */
export default async function ControleMensalPage({
  params,
}: {
  params: Promise<{ subcontaId: string; ano: string; mes: string }>
}) {
  const { ano, mes } = await params

  return (
    <TelaPlaceholder
      titulo={`Controle Mensal — ${mes}/${ano}`}
      descricao="Renda, Despesa Fixa e Despesa Variável (Planejado × Realizado × Diferença) + resumo 50-30-20."
      spec="Spec 04"
    />
  )
}
