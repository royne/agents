-- Migración Maestra V4: UNIFICADA Y SIN CONFLICTOS
-- 1. Eliminar triggers antiguos que causan conflictos encadenados
DROP TRIGGER IF EXISTS on_profile_created_credits ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Asegurar columna Celular
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Función Unificada: Crea Perfil y Créditos en un solo paso
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_name TEXT;
    v_role TEXT;
    v_plan TEXT;
    v_phone TEXT;
BEGIN
    -- Extraer metadatos
    v_name := COALESCE(new.raw_user_meta_data->>'full_name', '');
    v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
    v_plan := COALESCE(new.raw_user_meta_data->>'plan', 'free');
    
    -- Manejo seguro de la compañía
    BEGIN
        v_company_id := (new.raw_user_meta_data->>'company_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_company_id := NULL;
    END;

    -- A) INSERTAR EN PROFILES (Usando siempre el esquema public.)
    INSERT INTO public.profiles (id, user_id, company_id, role, name, email, plan, phone)
    VALUES (new.id, new.id, v_company_id, v_role, v_name, new.email, v_plan, v_phone)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        plan = EXCLUDED.plan,
        user_id = EXCLUDED.user_id;

    -- B) INSERTAR CRÉDITOS (Usando siempre el esquema public.)
    INSERT INTO public.user_credits (user_id, plan_key, balance)
    VALUES (new.id, v_plan, 50)
    ON CONFLICT (user_id) DO UPDATE SET
        balance = 50
        WHERE public.user_credits.balance = 20; -- Refuerzo por si ya existía con el default antiguo

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-crear el Trigger Unificado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. Forzar recarga de esquema para evitar errores 406
NOTIFY pgrst, 'reload schema';