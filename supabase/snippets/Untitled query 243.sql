-- Tabla de Cupones
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'extra_credits')),
    value NUMERIC NOT NULL,
    plan_key TEXT, -- NULL significa que aplica a todos los planes
    max_uses INTEGER DEFAULT 100,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registro de uso de cupones para evitar duplicidad por usuario
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_id TEXT, -- Referencia de Bold o pago manual
    used_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(coupon_id, user_id) -- Regla de oro: 1 cupón por usuario
);

-- RLS (Habilitar para admins)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas si existen para evitar errores en re-aplicación
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Users can read active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage usage" ON coupon_usage;

-- Politicas simples (Super Admin y Admin pueden todo)
CREATE POLICY "Admins can manage coupons" 
ON coupons FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
  )
);

CREATE POLICY "Users can read active coupons" 
ON coupons FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage usage" 
ON coupon_usage FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
  )
);