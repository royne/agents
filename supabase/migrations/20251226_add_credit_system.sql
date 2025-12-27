-- Migración para el Sistema de Créditos y Suscripciones

-- 0. Asegurar que profiles(user_id) tenga una restricción de unicidad para poder referenciarlo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 1. Tabla de Planes de Suscripción
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price_usd INTEGER NOT NULL,
    monthly_credits INTEGER NOT NULL,
    features JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar planes iniciales
INSERT INTO subscription_plans (key, name, price_usd, monthly_credits)
VALUES 
    ('free', 'Plan Gratuito', 0, 20),
    ('starter', 'Plan Starter', 19, 500),
    ('pro', 'Plan Pro', 39, 1200),
    ('business', 'Plan Business', 79, 3000),
    ('tester', 'Plan Tester', 0, 999999)
ON CONFLICT (key) DO UPDATE SET 
    monthly_credits = EXCLUDED.monthly_credits,
    price_usd = EXCLUDED.price_usd;

-- 2. Tabla de Créditos por Usuario
CREATE TABLE IF NOT EXISTS user_credits (
    user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
    plan_key TEXT REFERENCES subscription_plans(key) DEFAULT 'free',
    balance INTEGER NOT NULL DEFAULT 20,
    total_consumed INTEGER NOT NULL DEFAULT 0,
    unlimited_credits BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Auditoría (Log de Consumo)
CREATE TABLE IF NOT EXISTS usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'image_gen', 'chat_rag', 'excel_analysis'
    credits_spent INTEGER NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Función para inicializar créditos al crear un perfil
CREATE OR REPLACE FUNCTION handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_credits (user_id, plan_key, balance)
    VALUES (NEW.user_id, 'free', 20)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para automatizar creación de billetera de créditos
DROP TRIGGER IF EXISTS on_profile_created_credits ON profiles;
CREATE TRIGGER on_profile_created_credits
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_credits();

-- 6. Vincular usuarios existentes a la tabla de créditos si no tienen
INSERT INTO user_credits (user_id, plan_key, balance)
SELECT 
    user_id, 
    CASE 
        WHEN plan = 'premium' THEN 'pro'
        WHEN plan = 'basic' THEN 'free'
        WHEN plan = 'tester' THEN 'tester'
        ELSE 'free'
    END,
    20
FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- 6. Políticas RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer los planes
CREATE POLICY "Public profiles can see plans" ON subscription_plans FOR SELECT TO authenticated USING (true);

-- Usuarios pueden ver sus propios créditos
CREATE POLICY "Users can see their own credits" ON user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Usuarios pueden ver sus propios logs
CREATE POLICY "Users can see their own usage_log" ON usage_log FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- El Super Admin (owner o superadmin) puede hacer todo
CREATE POLICY "Admins can manage subscription_plans" ON subscription_plans FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (role = 'owner' OR role = 'superadmin')));

CREATE POLICY "Admins can manage user_credits" ON user_credits FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (role = 'owner' OR role = 'superadmin')));

CREATE POLICY "Admins can manage usage_log" ON usage_log FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (role = 'owner' OR role = 'superadmin')));
