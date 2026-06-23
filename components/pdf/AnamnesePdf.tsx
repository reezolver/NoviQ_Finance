import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import { formatarMoeda } from "@/lib/calculations"
import type { RespostasAnamnese } from "@/lib/anamnese"
import { PDF_COLORS } from "./theme"

/**
 * Template da **anamnese preenchida em PDF** — as respostas do cliente
 * (`anamneses.respostas`), agrupadas como no formulário: dados pessoais,
 * dependentes, renda, despesas (fixas/variáveis), investimento, patrimônio,
 * dívidas, objetivos e observações. Sem cálculo aqui — só layout (o diagnóstico
 * tem seu próprio template).
 */

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: PDF_COLORS.text,
    lineHeight: 1.4,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.primary,
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: PDF_COLORS.primary },
  title: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 8 },
  subtitle: { fontSize: 10, color: PDF_COLORS.muted, marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  table: { borderWidth: 1, borderColor: PDF_COLORS.border, borderRadius: 6 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: PDF_COLORS.border },
  th: {
    backgroundColor: PDF_COLORS.surface,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    color: PDF_COLORS.muted,
  },
  cell: { paddingVertical: 5, paddingHorizontal: 8 },
  cellNome: { flex: 2 },
  cellNum: { flex: 1, textAlign: "right", fontFamily: "Helvetica" },
  observacoes: {
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 6,
    padding: 10,
    color: PDF_COLORS.text,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 6,
    fontSize: 8,
    color: PDF_COLORS.muted,
    flexDirection: "row",
    justifyContent: "space-between",
  },
})

export interface AnamnesePdfProps {
  nomeLead: string
  emailLead: string | null
  preenchidaEm: string | null
  respostas: RespostasAnamnese
  geradoEm: string
}

/** Linha rótulo → valor monetário, com a última sem borda inferior. */
function LinhaValor({
  rotulo,
  valor,
  ultima = false,
}: {
  rotulo: string
  valor: number
  ultima?: boolean
}) {
  return (
    <View style={ultima ? [styles.tr, { borderBottomWidth: 0 }] : styles.tr}>
      <Text style={[styles.cell, styles.cellNome]}>{rotulo}</Text>
      <Text style={[styles.cell, styles.cellNum]}>{formatarMoeda(valor)}</Text>
    </View>
  )
}

/** Linha rótulo → texto livre. */
function LinhaTexto({
  rotulo,
  valor,
  ultima = false,
}: {
  rotulo: string
  valor: string
  ultima?: boolean
}) {
  return (
    <View style={ultima ? [styles.tr, { borderBottomWidth: 0 }] : styles.tr}>
      <Text style={[styles.cell, styles.cellNome]}>{rotulo}</Text>
      <Text style={[styles.cell, styles.cellNum, { fontFamily: "Helvetica" }]}>
        {valor || "—"}
      </Text>
    </View>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      <View style={styles.table}>{children}</View>
    </View>
  )
}

export function AnamnesePdf({
  nomeLead,
  emailLead,
  preenchidaEm,
  respostas,
  geradoEm,
}: AnamnesePdfProps) {
  const r = respostas
  const temDependentes = r.dependentes.length > 0
  const temDividas = r.dividas.length > 0
  const temObjetivos = r.objetivos.length > 0
  const temObservacoes = r.observacoes.trim().length > 0

  return (
    <Document title={`Anamnese — ${nomeLead}`} author="Noviq Finance">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Noviq Finance</Text>
          <Text style={styles.title}>Ficha Financeira (Anamnese) — {nomeLead}</Text>
          <Text style={styles.subtitle}>
            {emailLead ? `${emailLead} · ` : ""}
            {preenchidaEm ? `Preenchida em ${preenchidaEm}` : "Respostas do cliente"}
          </Text>
        </View>

        <Secao titulo="Dados pessoais">
          <LinhaTexto rotulo="Nome" valor={r.pessoal.nome} />
          <LinhaTexto rotulo="E-mail" valor={r.pessoal.email} />
          <LinhaTexto rotulo="Telefone" valor={r.pessoal.telefone} />
          <LinhaTexto
            rotulo="Idade"
            valor={r.pessoal.idade != null ? String(r.pessoal.idade) : ""}
          />
          <LinhaTexto rotulo="Profissão" valor={r.pessoal.profissao} />
          <LinhaTexto rotulo="Estado civil" valor={r.pessoal.estado_civil} ultima />
        </Secao>

        {temDependentes && (
          <Secao titulo="Dependentes">
            <View style={[styles.tr, styles.th]}>
              <Text style={[styles.cell, styles.cellNome]}>Nome</Text>
              <Text style={[styles.cell, styles.cellNum]}>Idade</Text>
            </View>
            {r.dependentes.map((d, i) => (
              <View
                key={i}
                style={
                  i === r.dependentes.length - 1
                    ? [styles.tr, { borderBottomWidth: 0 }]
                    : styles.tr
                }
              >
                <Text style={[styles.cell, styles.cellNome]}>{d.nome || "—"}</Text>
                <Text style={[styles.cell, styles.cellNum]}>{d.idade}</Text>
              </View>
            ))}
          </Secao>
        )}

        <Secao titulo="Renda mensal">
          <LinhaValor rotulo="Salário" valor={r.renda.salario} />
          <LinhaValor rotulo="Outras rendas" valor={r.renda.outras_rendas} ultima />
        </Secao>

        <Secao titulo="Despesas fixas (mensais)">
          <LinhaValor rotulo="Aluguel / Financiamento" valor={r.despesas.aluguel} />
          <LinhaValor rotulo="Contas da casa" valor={r.despesas.contas_casa} />
          <LinhaValor rotulo="Educação" valor={r.despesas.educacao} />
          <LinhaValor rotulo="Saúde" valor={r.despesas.saude} />
          <LinhaValor rotulo="Assinaturas" valor={r.despesas.assinaturas} />
          <LinhaValor rotulo="Outras despesas fixas" valor={r.despesas.outras_fixas} ultima />
        </Secao>

        <Secao titulo="Despesas variáveis (mensais)">
          <LinhaValor rotulo="Alimentação" valor={r.despesas.alimentacao} />
          <LinhaValor rotulo="Transporte" valor={r.despesas.transporte} />
          <LinhaValor rotulo="Lazer" valor={r.despesas.lazer} />
          <LinhaValor rotulo="Vestuário" valor={r.despesas.vestuario} />
          <LinhaValor
            rotulo="Outras despesas variáveis"
            valor={r.despesas.outras_variaveis}
            ultima
          />
        </Secao>

        <Secao titulo="Investimento e patrimônio">
          <LinhaValor rotulo="Aporte mensal" valor={r.investimento.aporte_mensal} />
          <LinhaValor rotulo="Reserva de emergência" valor={r.patrimonio.reserva_emergencia} />
          <LinhaValor rotulo="Investimentos" valor={r.patrimonio.investimentos} />
          <LinhaValor rotulo="Imóveis" valor={r.patrimonio.imoveis} />
          <LinhaValor rotulo="Veículos" valor={r.patrimonio.veiculos} ultima />
        </Secao>

        {temDividas && (
          <Secao titulo="Dívidas">
            <View style={[styles.tr, styles.th]}>
              <Text style={[styles.cell, styles.cellNome]}>Dívida</Text>
              <Text style={[styles.cell, styles.cellNum]}>Total</Text>
              <Text style={[styles.cell, styles.cellNum]}>Parcela</Text>
              <Text style={[styles.cell, styles.cellNum]}>Restam</Text>
            </View>
            {r.dividas.map((d, i) => (
              <View
                key={i}
                style={
                  i === r.dividas.length - 1
                    ? [styles.tr, { borderBottomWidth: 0 }]
                    : styles.tr
                }
              >
                <Text style={[styles.cell, styles.cellNome]}>{d.tipo}</Text>
                <Text style={[styles.cell, styles.cellNum]}>{formatarMoeda(d.valor_total)}</Text>
                <Text style={[styles.cell, styles.cellNum]}>{formatarMoeda(d.valor_parcela)}</Text>
                <Text style={[styles.cell, styles.cellNum]}>{d.parcelas_restantes}</Text>
              </View>
            ))}
          </Secao>
        )}

        {temObjetivos && (
          <Secao titulo="Objetivos">
            <View style={[styles.tr, styles.th]}>
              <Text style={[styles.cell, styles.cellNome]}>Objetivo</Text>
              <Text style={[styles.cell, styles.cellNum]}>Valor alvo</Text>
              <Text style={[styles.cell, styles.cellNum]}>Prazo (meses)</Text>
            </View>
            {r.objetivos.map((o, i) => (
              <View
                key={i}
                style={
                  i === r.objetivos.length - 1
                    ? [styles.tr, { borderBottomWidth: 0 }]
                    : styles.tr
                }
              >
                <Text style={[styles.cell, styles.cellNome]}>{o.nome}</Text>
                <Text style={[styles.cell, styles.cellNum]}>{formatarMoeda(o.valor_alvo)}</Text>
                <Text style={[styles.cell, styles.cellNum]}>{o.prazo_meses}</Text>
              </View>
            ))}
          </Secao>
        )}

        {temObservacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.observacoes}>{r.observacoes}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>Gerado por Noviq Finance em {geradoEm}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
