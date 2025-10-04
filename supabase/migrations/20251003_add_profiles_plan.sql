-- Add plan and modules_override to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'basic';

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS modules_override jsonb;
