-- Add mode column to debates table
ALTER TABLE public.debates 
ADD COLUMN mode text NOT NULL DEFAULT 'online' CHECK (mode IN ('online', 'offline'));