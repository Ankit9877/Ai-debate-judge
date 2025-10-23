-- Drop the old unique constraint that only allows one entry per user per debate
ALTER TABLE public.debate_participants 
DROP CONSTRAINT debate_participants_debate_id_user_id_key;

-- Add new unique constraint that allows one entry per user per debate per side
ALTER TABLE public.debate_participants 
ADD CONSTRAINT debate_participants_debate_id_user_id_side_key 
UNIQUE (debate_id, user_id, side);