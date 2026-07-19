"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { mascararMoeda } from "@/lib/moeda"

/**
 * Campo de dinheiro com máscara BR (Spec 34 · RF‑10).
 *
 * **Compõe** o `Input` do design system — não reimplementa nada de estilo, então
 * herda foco, `aria-invalid`, dark/light e tamanhos automaticamente.
 *
 * Comportamento (decidido com o cliente): cada dígito entra **pela direita, como
 * centavos** — `1` → `0,01`, `1000` → `10,00`, `100050` → `1.000,50`. Como o
 * número se reescreve inteiro a cada tecla, o cursor é mantido **sempre no
 * fim**: é onde a digitação acontece nesse modelo, e é o que elimina o "pulo de
 * cursor" clássico de input mascarado (R7) em vez de tentar remendá-lo.
 *
 * O valor exposto no `onChange` é a **string já formatada** (ex.: `"1.000,50"`),
 * o mesmo formato que os schemas das telas já validavam com `parseValorBR` —
 * por isso a máscara é puramente de apresentação e nenhuma Server Action ou
 * validação `zod` do servidor muda (R4).
 */
export function InputMoeda({
  value,
  onChange,
  permitirNegativo = false,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  /**
   * Texto já mascarado (ex.: `"1.000,50"`). Vazio = campo em branco.
   * Aceita `undefined` porque campos opcionais do `react-hook-form` chegam
   * assim — tratado como vazio, mantendo o input sempre controlado.
   */
  value: string | undefined
  /** Recebe o texto já mascarado. */
  onChange: (valor: string) => void
  /** Aceita "-" à esquerda. Só o saldo inicial precisa disso (Spec 25). */
  permitirNegativo?: boolean
}) {
  const interno = React.useRef<HTMLInputElement>(null)

  // Mantém o cursor no fim sempre que o texto mudar com o campo em foco.
  // Sem isso, reescrever o valor jogaria o cursor para o início.
  React.useEffect(() => {
    const el = interno.current
    if (el && document.activeElement === el) {
      const fim = el.value.length
      el.setSelectionRange(fim, fim)
    }
  }, [value])

  return (
    <Input
      {...props}
      // Teclado numérico no celular (R3).
      inputMode="decimal"
      placeholder={props.placeholder ?? "0,00"}
      value={value ?? ""}
      ref={(node: HTMLInputElement | null) => {
        interno.current = node
        // Encaminha para o ref do react-hook-form (R6) — sem isso o
        // `FormField` perde o foco automático no erro.
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      onChange={(evento) =>
        onChange(mascararMoeda(evento.target.value, { permitirNegativo }))
      }
      onFocus={(evento) => {
        const el = evento.currentTarget
        const fim = el.value.length
        el.setSelectionRange(fim, fim)
        props.onFocus?.(evento)
      }}
    />
  )
}
