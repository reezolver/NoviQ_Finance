'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

const ANCORAS = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Preços', href: '#precos' },
  { label: 'Perguntas', href: '#perguntas' },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="block dark:hidden" />
      <Moon className="hidden dark:block" />
    </Button>
  )
}

function Logo() {
  return (
    <Link href="/" aria-label="Noviq Finance — página inicial">
      {/* light mode */}
      <img
        src="/landing/logo-preta.svg"
        alt="Noviq Finance"
        height={32}
        className="h-8 block dark:hidden"
      />
      {/* dark mode */}
      <img
        src="/landing/logo-branca.svg"
        alt="Noviq Finance"
        height={32}
        className="h-8 hidden dark:block"
      />
    </Link>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Logo />

        {/* nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {ANCORAS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {a.label}
            </a>
          ))}
        </nav>

        {/* CTAs desktop + toggle */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>

        {/* mobile: toggle + hambúrguer */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                {open ? <X /> : <Menu />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 flex flex-col gap-6 pt-10">
              <nav className="flex flex-col gap-3">
                {ANCORAS.map((a) => (
                  <SheetClose asChild key={a.href}>
                    <a
                      href={a.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                      onClick={() => setOpen(false)}
                    >
                      {a.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>Entrar</Link>
                </Button>
                <Button asChild>
                  <Link href="/cadastro" onClick={() => setOpen(false)}>Criar conta</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
