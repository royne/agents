-- MIGRACIÓN REDISEÑADA: SISTEMA DE REFERIDOS (CONTROL ADMIN & LIQUIDACIÓN DINÁMICA)

-- 1. Modificar profiles para flag de mentor
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN NOT NULL DEFAULT false;

-- 2. Limpiar tablas y funciones previas si existen (Para asegurar consistencia)
DROP TABLE IF EXISTS public.referral_commissions CASCADE;
DROP TABLE IF EXISTS public.referral_configs CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;

DROP FUNCTION IF EXISTS public.generate_referral_code();
DROP FUNCTION IF EXISTS public.handle_new_profile_referral();
DROP FUNCTION IF EXISTS public.increment_mentor_balance(UUID, NUMERIC);
DROP FUNCTION IF EXISTS public.liquidate_mentor_commissions(UUID);

-- 3. Tabla de Configuración de Mentores
CREATE TABLE public.referral_configs (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL, -- Nombre de la comunidad (ej: 'vip-elite')
    tier TEXT NOT NULL DEFAULT 'silver' CHECK (tier IN ('silver', 'gold')),
    balance_paid NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Relación Mentor-Alumno
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, referred_id),
    UNIQUE(referred_id)
);

-- 5. Tabla de Comisiones (Solo registra la Venta Bruta)
CREATE TABLE public.referral_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
    sale_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Asociación Automática de Alumnos al Registrarse
CREATE OR REPLACE FUNCTION public.handle_new_profile_referral()
RETURNS TRIGGER AS $$
DECLARE
    v_referral_code TEXT;
    v_mentor_id UUID;
BEGIN
    -- Capturar el código de referido de la metadata de auth
    v_referral_code := (NEW.raw_user_meta_data->>'referral_code');
    
    -- Log para debug (opcional, se puede ver en los logs de Supabase)
    -- RAISE NOTICE 'Procesando registro: user %, code %', NEW.id, v_referral_code;

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

-- Trigger sobre auth.users para capturar el registro inicial
-- Usamos un nombre que alfabéticamente vaya después de 'on_auth_user_created'
DROP TRIGGER IF EXISTS tr_zz_referral_on_auth_user_created ON auth.users;
CREATE TRIGGER tr_zz_referral_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_referral();

-- 7. Nueva función de liquidación dinámica
CREATE OR REPLACE FUNCTION public.liquidate_mentor_period(p_mentor_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_tier TEXT;
    v_percent NUMERIC;
    v_total_sales NUMERIC;
    v_commission_total NUMERIC;
BEGIN
    -- 1. Obtener tier actual del mentor
    SELECT tier INTO v_tier FROM public.referral_configs WHERE user_id = p_mentor_id;
    
    -- 2. Definir porcentaje
    v_percent := CASE WHEN v_tier = 'gold' THEN 0.20 ELSE 0.15 END;
    
    -- 3. Sumar ventas pendientes
    SELECT COALESCE(SUM(sale_amount), 0) INTO v_total_sales 
    FROM public.referral_commissions 
    WHERE referral_id IN (SELECT id FROM public.referrals WHERE mentor_id = p_mentor_id)
    AND status = 'pending';
    
    v_commission_total := v_total_sales * v_percent;
    
    IF v_commission_total > 0 THEN
        -- 4. Marcar como pagadas
        UPDATE public.referral_commissions
        SET status = 'paid'
        WHERE referral_id IN (SELECT id FROM public.referrals WHERE mentor_id = p_mentor_id)
        AND status = 'pending';
        
        -- 5. Actualizar historial de pagos
        UPDATE public.referral_configs
        SET balance_paid = balance_paid + v_commission_total,
            updated_at = NOW()
        WHERE user_id = p_mentor_id;
    END IF;
    
    RETURN v_commission_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Función para obtener ventas pendientes de forma eficiente
CREATE OR REPLACE FUNCTION public.get_mentor_pending_sales(p_mentor_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(sale_amount), 0) INTO v_total
    FROM public.referral_commissions 
    WHERE referral_id IN (SELECT id FROM public.referrals WHERE mentor_id = p_mentor_id)
    AND status = 'pending';
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS e implementar políticas básicas
ALTER TABLE public.referral_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all referrals" ON public.referral_configs FOR ALL USING (true);
CREATE POLICY "Admins can manage all relations" ON public.referrals FOR ALL USING (true);
CREATE POLICY "Admins can manage all commissions" ON public.referral_commissions FOR ALL USING (true);

-- Seguridades para Mentores
CREATE POLICY "Mentors can see their config" ON public.referral_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Mentors can see their referrals" ON public.referrals FOR SELECT USING (auth.uid() = mentor_id);
CREATE POLICY "Mentors can see their commissions" ON public.referral_commissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.referrals WHERE referrals.id = referral_commissions.referral_id AND referrals.mentor_id = auth.uid())
);
