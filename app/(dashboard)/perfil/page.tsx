'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'

type ProfileType = 'cliente' | 'educador' | 'master'

interface UserProfile {
  id: string
  nome: string | null
  email: string
  tipo_perfil: ProfileType
  created_at: string
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
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

export default function PerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nome, setNome] = useState('')

  // Carregar dados do perfil
  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error || !profileData) {
          console.error('Erro ao carregar perfil:', error)
          return
        }

        setProfile({
          id: profileData.id,
          nome: profileData.nome,
          email: user.email || '',
          tipo_perfil: profileData.tipo_perfil,
          created_at: profileData.created_at,
        })

        setNome(profileData.nome || '')
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSaveName = async () => {
    if (!profile || !nome.trim()) return

    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ nome: nome.trim() })
        .eq('id', profile.id)

      if (error) {
        toast.error('Erro ao atualizar nome. Tente novamente.')
        return
      }

      setProfile({ ...profile, nome: nome.trim() })
      toast.success('Nome atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar nome. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = () => {
    router.push('/recuperar-senha')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações</p>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Erro ao carregar perfil do usuário.</p>
        </div>
      </div>
    )
  }

  const initials = getInitials(profile.nome)
  const badgeVariant = getBadgeVariant(profile.tipo_perfil)
  const badgeLabel = getBadgeLabel(profile.tipo_perfil)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações</p>
      </div>

      {/* Card Principal - Dados do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Seus dados cadastrais na plataforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar e Nome */}
          <div className="flex items-start gap-4">
            <Avatar className="size-20">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <Badge variant={badgeVariant} className="text-xs">
                {badgeLabel}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Membro desde {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Formulário de Nome */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>

            <Button onClick={handleSaveName} disabled={saving || !nome.trim()}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>

          <Separator />

          {/* E-mail (somente leitura) */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado. Entre em contato com o suporte se precisar atualizá-lo.
            </p>
          </div>

          <Separator />

          {/* Tipo de Perfil (somente leitura) */}
          <div className="space-y-2">
            <Label>Tipo de perfil</Label>
            <Badge variant={badgeVariant} className="text-sm">
              {badgeLabel}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Seu tipo de perfil define suas permissões na plataforma.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Gerencie sua senha e acesso</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleChangePassword}
            className="gap-2"
          >
            <KeyRound className="size-4" />
            Alterar senha
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
