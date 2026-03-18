-- RUN THIS SCRIPT EN SU LUGAR: SE SOLUCIONÓ EL ERROR DE LA COLUMNA SLUG

-- 1. Asegurar que las columnas existan antes de insertar nada
-- Si la tabla producers no existe, la crea con todo
CREATE TABLE IF NOT EXISTS public.producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  country TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Forzamos a que si la tabla ya existía, se le añada la columna slug si le falta
ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Configurar RLS (Seguridad)
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'producers' AND policyname = 'Producers are viewable by everyone'
    ) THEN
        CREATE POLICY "Producers are viewable by everyone" ON public.producers FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'producers' AND policyname = 'Users can insert their own producer profile'
    ) THEN
        CREATE POLICY "Users can insert their own producer profile" ON public.producers FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'producers' AND policyname = 'Users can update own producer profile'
    ) THEN
        CREATE POLICY "Users can update own producer profile" ON public.producers FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;


-- 2. Crear la función del Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Solo si seleccionó 'producer' al registrarse
  IF (NEW.raw_user_meta_data->>'role') = 'producer' THEN
    
    -- Generar slug desde el nombre de empresa
    base_slug := lower(regexp_replace(NEW.raw_user_meta_data->>'company_name', '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    IF base_slug IS NULL OR base_slug = '' THEN
      base_slug := 'producer-' || substr(NEW.id::text, 1, 8);
    END IF;
    
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.producers WHERE slug = final_slug) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    -- Insertar en la tabla
    INSERT INTO public.producers (
      user_id,
      company_name,
      country,
      slug
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unnamed Producer'),
      NEW.raw_user_meta_data->>'country',
      final_slug
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Crear el Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. Arreglar a los usuarios existentes (SOLO SI TIENEN PERFIL PRODUCTOR)
INSERT INTO public.producers (user_id, company_name, country, slug)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'company_name', 'Unnamed Producer'), 
  raw_user_meta_data->>'country',
  lower(regexp_replace(COALESCE(raw_user_meta_data->>'company_name', 'producer-' || substr(id::text, 1, 8)), '[^a-zA-Z0-9]+', '-', 'g'))
FROM auth.users
WHERE 
  raw_user_meta_data->>'role' = 'producer' 
  AND id NOT IN (SELECT user_id FROM public.producers);
