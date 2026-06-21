import { TelaPlaceholder } from '@/components/workspace/TelaPlaceholder'

/**
 * Investimentos — carteira (categoria, finalidade, distribuição) + PL e reserva
 * de emergência como derivados. Conteúdo real no Spec 06.
 */
export default function InvestimentosPage() {
  return (
    <TelaPlaceholder
      titulo="Investimentos"
      descricao="Carteira por categoria e finalidade, distribuição, patrimônio líquido e reserva de emergência."
      spec="Spec 06"
    />
  )
}
