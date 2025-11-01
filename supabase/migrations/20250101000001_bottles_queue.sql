-- Bottles Queue Table
-- Migration: Add asynchronous bottle creation queue
-- Tracks bottle creation requests through entire lifecycle:
-- queued -> uploading -> minting -> confirming -> completed/failed

CREATE TABLE IF NOT EXISTS bottles_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,

  -- Results from each stage
  ipfs_cid TEXT,
  blockchain_id INTEGER,

  -- Error tracking
  error TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Ensure status is valid
  CONSTRAINT valid_status CHECK (
    status IN ('queued', 'uploading', 'minting', 'confirming', 'completed', 'failed')
  )
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_bottles_queue_user_status
  ON bottles_queue(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bottles_queue_pending
  ON bottles_queue(status, created_at)
  WHERE status IN ('queued', 'uploading', 'minting', 'confirming');

CREATE INDEX IF NOT EXISTS idx_bottles_queue_cleanup
  ON bottles_queue(status, created_at)
  WHERE status IN ('completed', 'failed');

-- Enable Row Level Security
ALTER TABLE bottles_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (needed for Realtime updates in public app)
CREATE POLICY "Public read access queue"
  ON bottles_queue
  FOR SELECT
  USING (true);

-- Policy: Service role full access (API routes only)
CREATE POLICY "Service role full access queue"
  ON bottles_queue
  FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Enable Realtime for instant UI updates
ALTER PUBLICATION supabase_realtime ADD TABLE bottles_queue;

-- Comments
COMMENT ON TABLE bottles_queue IS 'Queue for asynchronous bottle creation with status tracking and Realtime updates';
COMMENT ON COLUMN bottles_queue.status IS 'Current stage: queued, uploading (IPFS), minting (blockchain), confirming, completed, failed';
COMMENT ON COLUMN bottles_queue.progress IS 'Approximate progress percentage (0-100) for UI feedback';
COMMENT ON COLUMN bottles_queue.message IS 'Bottle message content (temporarily stored until minted, then moved to IPFS)';
COMMENT ON COLUMN bottles_queue.attempts IS 'Number of processing attempts (max 3 before marking as failed)';
