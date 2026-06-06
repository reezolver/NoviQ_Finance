'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useTheme } from 'next-themes'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Sun, Moon, LogOut, User, ChevronUp, ChevronDown } from 'lucide-react'

type ProfileType = 'cliente' | 'educador' | 'master'

interface UserProfile {
  id: string
  nome: string
  email: string
  tipo_perfil: ProfileType
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getBadgeVariant(type: ProfileType): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'educador':
      return 'default'
    case 'master':
      return 'outline'
    default:
      return 'secondary'
  }
}

function getBadgeLabel(type: ProfileType): string {
  switch (type) {
    case 'educador':
      return 'Educador'
    case 'master':
      return 'Master'
    default:
      return 'Cliente'
  }
}

export function UserMenu() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar dados do usuário
  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('nome, tipo_perfil')
            .eq('id', user.id)
            .single()

          setProfile({
            id: user.id,
            nome: profileData?.nome || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
            tipo_perfil: profileData?.tipo_perfil || 'cliente',
          })
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleProfile = () => {
    setOpen(false)
    router.push('/perfil')
  }

  if (loading) {
    return (
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-muted animate-pulse rounded mb-1" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const initials = getInitials(profile.nome)
  const badgeVariant = getBadgeVariant(profile.tipo_perfil)
  const badgeLabel = getBadgeLabel(profile.tipo_perfil)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors text-left">
          {/* Avatar com iniciais */}
          <Avatar className="size-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {/* Nome e tipo de perfil */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {profile.nome}
            </div>
            <div className="text-xs text-muted-foreground">
              {badgeLabel}
            </div>
          </div>

          {/* Chevron */}
          {open ? (
            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronUp className="size-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0 mr-2" side="top" align="end">
        {/* Seção 1 — Info do Usuário */}
        <div className="p-4 flex flex-col items-center text-center border-b border-border">
          <Avatar className="size-16 mb-2">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <p className="font-semibold text-sm">{profile.nome}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </div>

        {/* Seção 2 — Tema */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="size-4 text-muted-foreground" />
              ) : (
                <Sun className="size-4 text-muted-foreground" />
              )}
              <Label htmlFor="theme-toggle" className="text-sm cursor-pointer">
                Tema
              </Label>
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        {/* Seção 3 — Conta */}
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleProfile}
          >
            <User className="size-4 mr-2" />
            Meu Perfil
          </Button>
        </div>

        <Separator />

        {/* Seção 4 — Sair */}
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="size-4 mr-2" />
            Sair
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
