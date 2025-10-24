-- -- supabase/migrations/20251024112700_add_delete_rls_for_debates.sql

-- -- Add RLS policy to allow debate creators to delete their debates
-- CREATE POLICY "Debate creators can delete their debates"
--   ON public.debates FOR DELETE
--   USING (auth.uid() = created_by);