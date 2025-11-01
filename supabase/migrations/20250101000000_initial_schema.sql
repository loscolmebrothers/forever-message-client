-- Initial Schema for Forever Message
-- Creates bottles, likes, and comments tables with proper RLS

-- ============================================================================
-- BOTTLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS bottles (
  id INTEGER PRIMARY KEY,
  creator TEXT NOT NULL,
  ipfs_hash TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_forever BOOLEAN DEFAULT FALSE,
  blockchain_status TEXT DEFAULT 'confirmed'
);

-- Indexes for bottles
CREATE INDEX IF NOT EXISTS idx_bottles_created_at ON bottles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bottles_user_id ON bottles(user_id);
CREATE INDEX IF NOT EXISTS idx_bottles_is_forever ON bottles(is_forever) WHERE is_forever = true;

-- Enable RLS
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (app is public)
CREATE POLICY "Public read access bottles"
  ON bottles
  FOR SELECT
  USING (true);

-- Policy: Service role full access
CREATE POLICY "Service role full access bottles"
  ON bottles
  FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bottles;

COMMENT ON TABLE bottles IS 'Message bottles minted on blockchain and stored on IPFS';


-- ============================================================================
-- LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  bottle_id INTEGER NOT NULL REFERENCES bottles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(bottle_id, user_id)
);

-- Indexes for likes
CREATE INDEX IF NOT EXISTS idx_likes_bottle_id ON likes(bottle_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "Public read access likes"
  ON likes
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert likes (public app)
CREATE POLICY "Public insert likes"
  ON likes
  FOR INSERT
  WITH CHECK (true);

-- Policy: Service role full access
CREATE POLICY "Service role full access likes"
  ON likes
  FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE likes;

COMMENT ON TABLE likes IS 'User likes for bottles (high volume, instant UX)';


-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY,
  bottle_id INTEGER NOT NULL REFERENCES bottles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  ipfs_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_bottle_id ON comments(bottle_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "Public read access comments"
  ON comments
  FOR SELECT
  USING (true);

-- Policy: Service role full access
CREATE POLICY "Service role full access comments"
  ON comments
  FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

COMMENT ON TABLE comments IS 'User comments on bottles (stored on IPFS)';
