-- Evolve Credit System: Add Expiry and Activity Status
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing users to have an expiration date if they don't have one
UPDATE user_credits SET expires_at = (NOW() + INTERVAL '30 days') WHERE expires_at IS NULL;

-- Index for performance on expiry checks
CREATE INDEX IF NOT EXISTS idx_user_credits_expires_at ON user_credits(expires_at);
