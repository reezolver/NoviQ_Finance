"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

const TEMAS = [
  { valor: "light", rotulo: "Claro", icone: Sun },
  { valor: "dark", rotulo: "Escuro", icone: Moon },
  { valor: "system", rotulo: "Sistema", icone: Monitor },
] as const

/**
 * **Aba Preferências** (Spec 22 · RF-4.5) — controle de **tema** (claro/escuro/
 * sistema) reusando `next-themes`. Ganchos de preferências futuras (idioma,
 * moeda) ficam visíveis porém **desabilitados** ("em breve"), sem bloquear.
 *
 * `next-themes` devolve `theme` como `undefined` no SSR e no 1º render do
 * cliente, então ligar o `value` direto não causa mismatch de hidratação (nada
 * fica selecionado até o tema resolver) — sem efeito de "montado".
 */
export function PreferenciasForm() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Tema</h3>
          <p className="text-sm text-muted-foreground">
            Escolha a aparência da interface.
          </p>
        </div>
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:max-w-md"
        >
          {TEMAS.map(({ valor, rotulo, icone: Icone }) => (
            <Label
              key={valor}
              htmlFor={`tema-${valor}`}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5"
            >
              <RadioGroupItem id={`tema-${valor}`} value={valor} />
              <Icone className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{rotulo}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Ganchos futuros (F6) — visíveis, desabilitados. */}
      <div className="space-y-3 opacity-60">
        <h3 className="text-sm font-medium">Em breve</h3>
        <div className="grid gap-2 sm:max-w-md">
          {["Idioma", "Moeda", "Notificações"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm">{item}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                em breve
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
