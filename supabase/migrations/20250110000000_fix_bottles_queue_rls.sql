-- Fix RLS Policy for bottles_queue
-- Migration: Add policy for authenticated users to insert their own bottles
-- Ensures authenticated users can create bottles with their wallet address as user_id

-- Policy: Authenticated users can insert their own bottles
-- This allows users to create bottles where user_id matches their wallet address from JWT metadata
CREATE POLICY "Authenticated users can insert own bottles"
  ON bottles_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'wallet_address',
      current_setting('request.jwt.claims', true)::json->'user_metadata'->>'wallet_address'
    )
  );

-- Policy: Authenticated users can update their own bottles (for status tracking if needed)
CREATE POLICY "Authenticated users can update own bottles"
  ON bottles_queue
  FOR UPDATE
  TO authenticated
  USING (
    user_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'wallet_address',
      current_setting('request.jwt.claims', true)::json->'user_metadata'->>'wallet_address'
    )
  )
  WITH CHECK (
    user_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'wallet_address',
      current_setting('request.jwt.claims', true)::json->'user_metadata'->>'wallet_address'
    )
  );

-- Comments
COMMENT ON POLICY "Authenticated users can insert own bottles" ON bottles_queue IS
  'Allows authenticated users to create bottles with their wallet address as user_id. Extracts wallet_address from JWT claims or user_metadata.';

COMMENT ON POLICY "Authenticated users can update own bottles" ON bottles_queue IS
  'Allows authenticated users to update only their own bottles. Useful for client-side status tracking.';
