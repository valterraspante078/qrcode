-- ========================================================
-- SCRIPT DE CORREÇÃO: TRIGGER DE AFILIADOS (VERSÃO ROBUSTA)
-- ========================================================
-- Este script foi atualizado para ser mais seguro e não impedir
-- o cadastro do usuário mesmo se houver erro no perfil.

-- 1. Garantir que as colunas existam na tabela profiles
-- (Isso evita erros se as colunas estiverem faltando)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Atualizar a função com tratamento de erros (EXCEPTION)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, display_name, referred_by)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'display_name', ''),
      new.raw_user_meta_data->>'referred_by'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      referred_by = COALESCE(profiles.referred_by, EXCLUDED.referred_by);
  EXCEPTION WHEN OTHERS THEN
    -- Se houver qualquer erro (coluna faltando, etc), o log será registrado
    -- mas o cadastro em auth.users NÃO será interrompido.
    RAISE WARNING 'Erro ao criar perfil para o usuário %: %', new.id, SQLERRM;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar o trigger para garantir que esteja ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
