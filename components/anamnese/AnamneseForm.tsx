"use client"

import * as React from "react"
import {
  useForm,
  useFieldArray,
  type Control,
  type FieldPath,
  type Resolver,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { respostasSchema } from "@/lib/anamnese"
import {
  EstadoAnamnese,
  TEXTO_JA_ENVIADA,
} from "@/components/anamnese/EstadoAnamnese"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = respostasSchema.extend({
  consentimento: z
    .boolean()
    .refine((v) => v === true, "É necessário aceitar para enviar."),
})

type FormValues = z.infer<typeof formSchema>

/** Um erro de validação vindo do servidor, já no caminho do campo do form. */
interface DetalheErro {
  campo: string
  mensagem: string
}

/** Corpo de erro do `POST /api/anamnese/[token]` (contrato da Spec 29 §3.2). */
interface RespostaErro {
  error?: string
  detalhes?: DetalheErro[]
}

const VALORES_INICIAIS: FormValues = {
  pessoal: {
    nome: "",
    email: "",
    telefone: "",
    idade: undefined,
    profissao: "",
    estado_civil: "",
  },
  dependentes: [],
  renda: { salario: 0, outras_rendas: 0 },
  despesas: {
    aluguel: 0,
    contas_casa: 0,
    educacao: 0,
    saude: 0,
    assinaturas: 0,
    outras_fixas: 0,
    alimentacao: 0,
    transporte: 0,
    lazer: 0,
    vestuario: 0,
    outras_variaveis: 0,
  },
  investimento: { aporte_mensal: 0 },
  patrimonio: { reserva_emergencia: 0, investimentos: 0, imoveis: 0, veiculos: 0 },
  dividas: [],
  objetivos: [],
  observacoes: "",
  consentimento: false,
}

/**
 * Formulário público da anamnese. Coleta dados pessoais, dependentes (lista),
 * renda, despesas (fixas/variáveis), aporte, patrimônio, dívidas, objetivos e o
 * consentimento LGPD; envia para o Route Handler `POST /api/anamnese/[token]`.
 * O diagnóstico é calculado no servidor — aqui só validamos e enviamos.
 */
export function AnamneseForm({
  token,
  nomeInicial,
}: {
  token: string
  nomeInicial: string
}) {
  const [enviando, setEnviando] = React.useState(false)
  const [enviado, setEnviado] = React.useState(false)
  /** 409 do servidor: o link já tinha sido usado (R4). */
  const [jaEnviada, setJaEnviada] = React.useState(false)

  // `respostasSchema` usa `coerce`/`default` (defesa na submissão), o que faz o
  // tipo de entrada divergir do de saída. O cast alinha o resolver ao
  // `FormValues` (saída), já que os campos emitem números diretamente.
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: { ...VALORES_INICIAIS, pessoal: { ...VALORES_INICIAIS.pessoal, nome: nomeInicial } },
  })

  const dependentes = useFieldArray({ control: form.control, name: "dependentes" })
  const dividas = useFieldArray({ control: form.control, name: "dividas" })
  const objetivos = useFieldArray({ control: form.control, name: "objetivos" })

  async function onSubmit(values: FormValues) {
    setEnviando(true)
    try {
      const { consentimento, ...respostas } = values
      const res = await fetch(`/api/anamnese/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas, consentimento }),
      })

      if (res.ok) {
        setEnviado(true)
        return
      }

      const corpo = (await res.json().catch(() => null)) as RespostaErro | null

      // Link de uso único: comportamento correto do produto → vira estado, não
      // erro vermelho (R4).
      if (res.status === 409) {
        setJaEnviada(true)
        return
      }

      // Validação: aponta o campo exato e **preserva o que já foi digitado**
      // (`setError` não mexe nos valores) — R1 e R3.
      if (res.status === 422 && corpo?.detalhes?.length) {
        aplicarErrosDeCampo(corpo.detalhes)
        toast.error(corpo.error ?? "Confira os campos destacados e envie de novo.")
        return
      }

      toast.error(corpo?.error ?? "Não foi possível enviar a anamnese.")
    } catch {
      // Só cai aqui em falha de rede — o corpo de erro já foi tratado acima.
      toast.error("Falha de conexão. Confira sua internet e tente de novo.")
    } finally {
      setEnviando(false)
    }
  }

  /**
   * Escreve cada `{ campo, mensagem }` do servidor no campo correspondente do
   * formulário e leva o foco para o primeiro. `campo` já vem como caminho de
   * formulário (ex.: `pessoal.email`, `dependentes.0.idade`). Um campo
   * desconhecido (schema do servidor à frente do client) não pode sumir: cai
   * num toast em vez de ser descartado silenciosamente.
   */
  function aplicarErrosDeCampo(detalhes: DetalheErro[]) {
    let primeiro: FieldPath<FormValues> | null = null
    for (const { campo, mensagem } of detalhes) {
      if (!campo) {
        toast.error(mensagem)
        continue
      }
      const caminho = campo as FieldPath<FormValues>
      form.setError(caminho, { type: "server", message: mensagem })
      primeiro ??= caminho
    }
    if (primeiro) form.setFocus(primeiro)
  }

  if (enviado) {
    return (
      <EstadoAnamnese
        icone={<CheckCircle2 className="size-6 text-success" />}
        titulo="Anamnese enviada!"
        descricao="Suas respostas foram enviadas com sucesso. Seu assessor vai analisá-las antes da reunião. Obrigado!"
        destaque="success"
      />
    )
  }

  // Mesma tela que a página mostra quando o link já chega preenchido.
  if (jaEnviada) {
    return (
      <EstadoAnamnese
        icone={<CheckCircle2 className="size-6 text-success" />}
        titulo={TEXTO_JA_ENVIADA.titulo}
        descricao={TEXTO_JA_ENVIADA.descricao}
        destaque="success"
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="pessoal.nome"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pessoal.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="voce@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pessoal.telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CampoInteiro control={form.control} name="pessoal.idade" label="Idade" />
            <FormField
              control={form.control}
              name="pessoal.estado_civil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado civil</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Casado(a)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pessoal.profissao"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Profissão</FormLabel>
                  <FormControl>
                    <Input placeholder="Sua profissão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Dependentes (lista) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dependentes</CardTitle>
            <CardDescription>
              Filhos ou outras pessoas que dependem financeiramente de você.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dependentes.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum dependente.</p>
            )}
            {dependentes.fields.map((item, indice) => (
              <div key={item.id} className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`dependentes.${indice}.nome`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do dependente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <CampoInteiro
                  control={form.control}
                  name={`dependentes.${indice}.idade`}
                  label="Idade"
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  aria-label="Remover dependente"
                  onClick={() => dependentes.remove(indice)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dependentes.append({ nome: "", idade: undefined })}
            >
              <Plus />
              Adicionar dependente
            </Button>
          </CardContent>
        </Card>

        {/* Renda */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Renda mensal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <CampoMoeda control={form.control} name="renda.salario" label="Salário / pró-labore" />
            <CampoMoeda control={form.control} name="renda.outras_rendas" label="Outras rendas" />
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas mensais</CardTitle>
            <CardDescription>Valores médios por mês.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Fixas</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoMoeda control={form.control} name="despesas.aluguel" label="Aluguel / financiamento" />
                <CampoMoeda control={form.control} name="despesas.contas_casa" label="Contas da casa (luz, água, internet, gás)" />
                <CampoMoeda control={form.control} name="despesas.educacao" label="Educação" />
                <CampoMoeda control={form.control} name="despesas.saude" label="Saúde / plano" />
                <CampoMoeda control={form.control} name="despesas.assinaturas" label="Assinaturas" />
                <CampoMoeda control={form.control} name="despesas.outras_fixas" label="Outras despesas fixas" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Variáveis</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoMoeda control={form.control} name="despesas.alimentacao" label="Alimentação" />
                <CampoMoeda control={form.control} name="despesas.transporte" label="Transporte (combustível, app, ônibus)" />
                <CampoMoeda control={form.control} name="despesas.lazer" label="Lazer" />
                <CampoMoeda control={form.control} name="despesas.vestuario" label="Vestuário" />
                <CampoMoeda control={form.control} name="despesas.outras_variaveis" label="Outras despesas variáveis" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investimento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investimento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <CampoMoeda control={form.control} name="investimento.aporte_mensal" label="Quanto investe por mês (aporte)" />
          </CardContent>
        </Card>

        {/* Patrimônio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patrimônio</CardTitle>
            <CardDescription>Valores atuais aproximados.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <CampoMoeda control={form.control} name="patrimonio.reserva_emergencia" label="Reserva de emergência" />
            <CampoMoeda control={form.control} name="patrimonio.investimentos" label="Investimentos" />
            <CampoMoeda control={form.control} name="patrimonio.imoveis" label="Imóveis" />
            <CampoMoeda control={form.control} name="patrimonio.veiculos" label="Veículos" />
          </CardContent>
        </Card>

        {/* Dívidas (lista) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dívidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dividas.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma dívida.</p>
            )}
            {dividas.fields.map((item, indice) => (
              <div key={item.id} className="space-y-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dívida {indice + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    aria-label="Remover dívida"
                    onClick={() => dividas.remove(indice)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`dividas.${indice}.tipo`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Cartão, empréstimo, financiamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <CampoMoeda control={form.control} name={`dividas.${indice}.valor_total`} label="Valor total" />
                  <CampoMoeda control={form.control} name={`dividas.${indice}.valor_parcela`} label="Parcela" />
                  <CampoInteiro control={form.control} name={`dividas.${indice}.parcelas_restantes`} label="Parcelas restantes" />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                dividas.append({
                  tipo: "",
                  valor_total: 0,
                  valor_parcela: 0,
                  parcelas_restantes: 0,
                })
              }
            >
              <Plus />
              Adicionar dívida
            </Button>
          </CardContent>
        </Card>

        {/* Objetivos (lista) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Objetivos</CardTitle>
            <CardDescription>Metas financeiras que você quer alcançar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {objetivos.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum objetivo.</p>
            )}
            {objetivos.fields.map((item, indice) => (
              <div key={item.id} className="space-y-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Objetivo {indice + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    aria-label="Remover objetivo"
                    onClick={() => objetivos.remove(indice)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`objetivos.${indice}.nome`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Comprar um carro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoMoeda control={form.control} name={`objetivos.${indice}.valor_alvo`} label="Valor alvo" />
                  <CampoInteiro control={form.control} name={`objetivos.${indice}.prazo_meses`} label="Prazo (meses)" />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => objetivos.append({ nome: "", valor_alvo: 0, prazo_meses: 12 })}
            >
              <Plus />
              Adicionar objetivo
            </Button>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Algo mais que seu assessor precisa saber?"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Consentimento LGPD */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="consentimento"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Autorizo o uso dos meus dados financeiros para análise pelo
                      meu assessor, conforme a LGPD.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar anamnese"}
        </Button>
      </form>
    </Form>
  )
}

/** Campo monetário controlado (≥ 0). Vazio = 0. */
function CampoMoeda({
  control,
  name,
  label,
}: {
  control: Control<FormValues>
  name: FieldPath<FormValues>
  label: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0,00"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value === 0 || field.value == null ? "" : String(field.value)}
              onChange={(e) =>
                field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/** Campo inteiro controlado (≥ 0). Vazio = vazio (mantém `undefined`/0). */
function CampoInteiro({
  control,
  name,
  label,
  className,
}: {
  control: Control<FormValues>
  name: FieldPath<FormValues>
  label: string
  className?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="0"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value == null ? "" : String(field.value)}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
