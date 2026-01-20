-- Migración para añadir soporte internacional
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Colombia';

-- Actualizar la función handle_new_auth_user para guardar el país
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_name TEXT;
    v_role TEXT;
    v_plan TEXT;
    v_phone TEXT;
    v_country TEXT;
BEGIN
    -- Extraer metadatos
    v_name := COALESCE(new.raw_user_meta_data->>'full_name', '');
    v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
    v_plan := COALESCE(new.raw_user_meta_data->>'plan', 'free');
    v_country := COALESCE(new.raw_user_meta_data->>'country', 'Colombia');
    
    -- Manejo seguro de la compañía
    BEGIN
        v_company_id := (new.raw_user_meta_data->>'company_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_company_id := NULL;
    END;

    -- A) INSERTAR EN PROFILES
    INSERT INTO public.profiles (id, user_id, company_id, role, name, email, plan, phone, country)
    VALUES (new.id, new.id, v_company_id, v_role, v_name, new.email, v_plan, v_phone, v_country)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        plan = EXCLUDED.plan,
        country = EXCLUDED.country,
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
