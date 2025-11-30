-- Add transaction_hash column to bottles_queue
-- Stores the blockchain transaction hash for linking to block explorer

ALTER TABLE bottles_queue
ADD COLUMN IF NOT EXISTS transaction_hash TEXT;

COMMENT ON COLUMN bottles_queue.transaction_hash IS 'Blockchain transaction hash from bottle creation (for block explorer links)';
