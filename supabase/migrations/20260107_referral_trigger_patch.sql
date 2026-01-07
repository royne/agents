-- PARCHE DE SEGURIDAD: Solo aplica el Trigger y la Función de Referidos
-- Úsalo si ya tienes datos en las tablas de referidos y no quieres borrarlas.

-- 1. Función de Asociación (Safe to Replace)
CREATE OR REPLACE FUNCTION public.handle_new_profile_referral()
RETURNS TRIGGER AS $$
DECLARE
    v_referral_code TEXT;
    v_mentor_id UUID;
BEGIN
    -- Capturar el código de referido de la metadata de auth
    v_referral_code := (NEW.raw_user_meta_data->>'referral_code');
    
    IF v_referral_code IS NOT NULL AND v_referral_code <> '' THEN
        -- Buscar al mentor que tiene ese código
        SELECT user_id INTO v_mentor_id 
        FROM public.referral_configs 
        WHERE referral_code = LOWER(TRIM(v_referral_code));
        
        -- Si existe el mentor, crear la relación en referrals
        IF v_mentor_id IS NOT NULL AND v_mentor_id <> NEW.id THEN
            INSERT INTO public.referrals (mentor_id, referred_id, status)
            VALUES (v_mentor_id, NEW.id, 'registered')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger (Safe to Drop and Recreate)
DROP TRIGGER IF EXISTS tr_zz_referral_on_auth_user_created ON auth.users;
CREATE TRIGGER tr_zz_referral_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_referral();
