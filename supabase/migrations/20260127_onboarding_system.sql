-- MIGRACIÓN: SISTEMA DE ONBOARDING PROGRESIVO
-- Este script añade campos para captura de datos post-login y control de flujo.

-- 1. Añadir nuevas columnas a public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS is_setup_completed BOOLEAN NOT NULL DEFAULT false;

-- 2. Marcar a todos los usuarios actuales como 'completados' 
UPDATE public.profiles SET is_setup_completed = true;

-- 3. Eliminar Trigger antiguo de referidos (Caja Negra)
DROP TRIGGER IF EXISTS tr_zz_referral_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_profile_referral();

-- 4. Corregir columna country (Quitar default de Colombia para que el onboarding funcione bien)
ALTER TABLE public.profiles ALTER COLUMN country DROP DEFAULT;

-- 5. ACTUALIZAR TRIGGER GLOBAL DE PERFILES (Para capturar avatar_url de Google)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_name TEXT;
    v_role TEXT;
    v_plan TEXT;
    v_phone TEXT;
    v_avatar TEXT;
BEGIN
    -- Extraer metadatos (Google manda full_name y avatar_url en raw_user_meta_data)
    v_name := COALESCE(new.raw_user_meta_data->>'full_name', '');
    v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');
    v_avatar := COALESCE(new.raw_user_meta_data->>'avatar_url', '');
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
    v_plan := COALESCE(new.raw_user_meta_data->>'plan', 'free');
    
    -- Manejo seguro de la compañía
    BEGIN
        v_company_id := (new.raw_user_meta_data->>'company_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_company_id := NULL;
    END;

    -- A) INSERTAR EN PROFILES
    INSERT INTO public.profiles (id, user_id, company_id, role, name, email, plan, phone, avatar_url)
    VALUES (new.id, new.id, v_company_id, v_role, v_name, new.email, v_plan, v_phone, v_avatar)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        plan = EXCLUDED.plan,
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        user_id = EXCLUDED.user_id;

    -- B) INSERTAR CRÉDITOS
    INSERT INTO public.user_credits (user_id, plan_key, balance)
    VALUES (new.id, v_plan, 50)
    ON CONFLICT (user_id) DO UPDATE SET
        balance = 50
        WHERE public.user_credits.balance = 20;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Forzar recarga de esquema
NOTIFY pgrst, 'reload schema';
