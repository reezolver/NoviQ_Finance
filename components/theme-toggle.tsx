'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

/**
 * Alterna entre tema claro e escuro.
 *
 * Os dois ícones são sempre renderizados e a visibilidade é decidida por CSS
 * (`dark:`), espelhando a classe que o `next-themes` aplica no `<html>`. Assim
 * o markup é estável entre servidor e cliente (sem mismatch de hidratação) e
 * sem `useEffect`/`useState` para "montar". `resolvedTheme` é lido só no
 * clique, onde já está resolvido.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="rounded-full"
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
