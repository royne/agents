-- Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    plan_key TEXT NOT NULL REFERENCES public.subscription_plans(key),
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'COP',
    external_reference TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all payment history
CREATE POLICY "Admins can see all payment history" ON public.payment_history
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND (profiles.role = 'owner' OR profiles.role = 'superadmin' OR profiles.role = 'admin')
    ));

-- Policy for users to see their own payment history
CREATE POLICY "Users can see their own payment history" ON public.payment_history
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at);
