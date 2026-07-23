/**
 * Cartão de crédito — resolução do **mês da fatura** (Spec 38 · RF‑19).
 *
 * ⚠️ **Esta é a regra de negócio central da feature.** Errar aqui manda a
 * despesa para o mês errado em todos os relatórios, e de forma silenciosa: sem
 * erro, sem alerta. O cliente só descobre quando os números não batem com a
 * fatura do banco.
 *
 * ## A regra (validada com o Thiago em 2026‑07‑19)
 *
 * Uma compra tem duas datas: a **data da compra** (competência) e o **mês em
 * que ela é cobrada** (caixa). O usuário informa só a primeira.
 *
 * 1. Comprou **antes** do dia de fechamento → entra na fatura que fecha **neste**
 *    mês. Comprou **no dia do fechamento ou depois** → entra na fatura do mês
 *    **seguinte**.
 *    > Difere do rascunho do PRD, que propunha `dia_compra <= fechamento` para a
 *    > fatura corrente. O Thiago confirmou o contrário: **no dia do fechamento a
 *    > compra já vai para a próxima fatura**.
 * 2. A despesa aparece no Controle Mensal no mês do **vencimento** — é quando o
 *    dinheiro sai da conta.
 * 3. Quando o vencimento cai num dia **anterior** ao fechamento (ex.: fecha 28,
 *    vence 5), o vencimento é no **mês seguinte** ao fechamento.
 *
 * O resultado é **persistido no lançamento**, nunca recalculado na leitura
 * (R19.4): mudar o `dia_fechamento` do cartão depois não pode remanejar o
 * histórico financeiro do cliente.
 */

/** Mês/ano em que a despesa do cartão aparece no Controle Mensal. */
export interface MesFatura {
  ano: number
  mes: number
}

/**
 * Último dia de um mês (trata bissexto). Base da R19.1: um cartão que fecha dia
 * 31 precisa fechar dia 28 em fevereiro — o dia configurado nem sempre existe.
 */
export function ultimoDiaDoMes(ano: number, mes: number): number {
  // Dia 0 do mês seguinte = último dia deste mês.
  return new Date(ano, mes, 0).getDate()
}

/** Ajusta o dia configurado ao mês real (31 em fevereiro vira 28/29). */
function diaEfetivo(ano: number, mes: number, diaConfigurado: number): number {
  return Math.min(diaConfigurado, ultimoDiaDoMes(ano, mes))
}

/** Soma meses a um par ano/mês, rolando o ano corretamente (R19.2). */
function somarMeses(ano: number, mes: number, delta: number): MesFatura {
  const zeroBased = mes - 1 + delta
  return {
    ano: ano + Math.floor(zeroBased / 12),
    mes: ((zeroBased % 12) + 12) % 12 + 1,
  }
}

/**
 * Resolve em que mês do Controle Mensal a compra aparece.
 *
 * @param dataCompra `YYYY-MM-DD` — a data que o usuário digitou (competência).
 * @param diaFechamento 1–31, do cadastro do cartão.
 * @param diaVencimento 1–31, do cadastro do cartão.
 */
export function resolverMesFatura(
  dataCompra: string,
  diaFechamento: number,
  diaVencimento: number
): MesFatura {
  // Lemos a string direto: `new Date("2026-07-01")` é UTC e retrocede um dia em
  // fuso negativo — o mesmo bug que já corrompeu `calcularMesesRestantes`.
  const [ano, mes, dia] = dataCompra.split("-").map(Number)

  const fechamentoDoMes = diaEfetivo(ano, mes, diaFechamento)

  // 1) Em que mês esta compra FECHA. No dia do fechamento já é a próxima (Q7).
  const mesQueFecha = dia < fechamentoDoMes
    ? { ano, mes }
    : somarMeses(ano, mes, 1)

  // 2) O vencimento pode cair no mesmo mês do fechamento ou no seguinte.
  //    Fecha 28 / vence 5 → vence no mês seguinte ao fechamento (Q7).
  const vencimentoNoMesmoMes = diaVencimento > diaFechamento
  return vencimentoNoMesmoMes
    ? mesQueFecha
    : somarMeses(mesQueFecha.ano, mesQueFecha.mes, 1)
}

/** Rótulo curto do cartão para a linha do bloco ("Cartão: Nubank"). */
export function nomeLinhaCartao(nomeCartao: string): string {
  return `Cartão: ${nomeCartao}`
}
