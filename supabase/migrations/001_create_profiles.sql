-- Criação da tabela profiles
-- Esta tabela armazena informações adicionais dos usuários do sistema
-- Execute este SQL no SQL Editor do Supabase

-- 1. Criar a tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  tipo_perfil TEXT NOT NULL CHECK (tipo_perfil IN ('master', 'educador', 'cliente')),
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS profiles_tipo_perfil_idx ON public.profiles(tipo_perfil);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar policies de segurança

-- Policy: Usuários podem ler o próprio profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Usuários podem atualizar o próprio profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Educadores e master podem ler todos os profiles
CREATE POLICY "Educators and master can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo_perfil IN ('educador', 'master')
    )
  );

-- 5. Criar trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Criar trigger automático para criar profile quando um usuário é criado no auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tipo_perfil, nome)
  VALUES (
    NEW.id,
    'cliente', -- Default: novos usuários são clientes
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Inserir um usuário master manualmente (se necessário)
-- Para criar o primeiro usuário master, use o Supabase Auth e depois execute:
-- UPDATE public.profiles SET tipo_perfil = 'master' WHERE id = 'UUID_DO_USUARIO';
