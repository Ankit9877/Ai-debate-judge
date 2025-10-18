-- Filename: src/supabase/migrations/20251019000000_fix_offline_debate_participants.sql

-- Step 1: Drop the original, incorrect composite unique constraint.
-- This constraint 'UNIQUE(debate_id, user_id)' was too restrictive for single-user offline debates.
ALTER TABLE public.debate_participants 
  DROP CONSTRAINT IF EXISTS "debate_participants_debate_id_user_id_key";

-- Step 2: Add the new, correct composite unique constraint.
-- This enforces uniqueness on (debate_id, user_id, side), allowing a user to insert 
-- both an 'a' and a 'b' record.
ALTER TABLE public.debate_participants 
  ADD CONSTRAINT debate_participants_debate_id_user_id_side_key 
  UNIQUE(debate_id, user_id, side);