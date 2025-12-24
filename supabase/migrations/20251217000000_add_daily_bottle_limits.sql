-- Daily Bottle Limits Table
-- Migration: Add rate limiting for bottle creation (3 per user per 24 hours)
-- Uses on-the-fly reset logic: check if >24h since last_reset_at, then reset counter

CREATE TABLE IF NOT EXISTS bottle_daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  bottles_created INTEGER NOT NULL DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT bottles_created_non_negative CHECK (bottles_created >= 0),
  CONSTRAINT bottles_created_max CHECK (bottles_created <= 3)
);

-- Index for fast user lookups (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_bottle_daily_limits_user_id
  ON bottle_daily_limits(user_id);

-- Index for cleanup queries (find expired records)
CREATE INDEX IF NOT EXISTS idx_bottle_daily_limits_last_reset
  ON bottle_daily_limits(last_reset_at);

-- Enable Row Level Security
ALTER TABLE bottle_daily_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own limits (authenticated)
CREATE POLICY "Users can read own limits"
  ON bottle_daily_limits
  FOR SELECT
  TO authenticated
  USING (
    user_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'wallet_address',
      current_setting('request.jwt.claims', true)::json->'user_metadata'->>'wallet_address'
    )
  );

-- Policy: Service role full access (for API routes)
CREATE POLICY "Service role full access limits"
  ON bottle_daily_limits
  FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_bottle_daily_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on every update
CREATE TRIGGER trigger_bottle_daily_limits_updated_at
  BEFORE UPDATE ON bottle_daily_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_bottle_daily_limits_updated_at();

-- Comments
COMMENT ON TABLE bottle_daily_limits IS 'Rate limiting for bottle creation: tracks daily usage per user with automatic 24h reset';
COMMENT ON COLUMN bottle_daily_limits.user_id IS 'Wallet address (lowercase) from JWT user_metadata.wallet_address';
COMMENT ON COLUMN bottle_daily_limits.bottles_created IS 'Count of bottles created in current 24h window (max 3)';
COMMENT ON COLUMN bottle_daily_limits.last_reset_at IS 'Timestamp of last counter reset; used for 24h window calculation';
