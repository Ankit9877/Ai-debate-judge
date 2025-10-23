-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create debates table
CREATE TABLE public.debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  side_a_name TEXT NOT NULL DEFAULT 'Side A',
  side_b_name TEXT NOT NULL DEFAULT 'Side B',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  max_arguments INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view debates"
  ON public.debates FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create debates"
  ON public.debates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Debate creators can update their debates"
  ON public.debates FOR UPDATE
  USING (auth.uid() = created_by);

-- Create debate_participants table
CREATE TABLE public.debate_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES public.debates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('a', 'b')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(debate_id, user_id)
);

ALTER TABLE public.debate_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants"
  ON public.debate_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join debates"
  ON public.debate_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create debate_arguments table
CREATE TABLE public.debate_arguments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES public.debates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('a', 'b')),
  content TEXT NOT NULL,
  argument_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.debate_arguments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view arguments"
  ON public.debate_arguments FOR SELECT
  USING (true);

CREATE POLICY "Participants can add arguments"
  ON public.debate_arguments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.debate_participants
      WHERE debate_id = debate_arguments.debate_id
      AND user_id = auth.uid()
      AND side = debate_arguments.side
    )
  );

-- Create debate_results table
CREATE TABLE public.debate_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES public.debates(id) ON DELETE CASCADE UNIQUE NOT NULL,
  side_a_score INTEGER NOT NULL CHECK (side_a_score >= 0 AND side_a_score <= 100),
  side_b_score INTEGER NOT NULL CHECK (side_b_score >= 0 AND side_b_score <= 100),
  side_a_logic_score INTEGER CHECK (side_a_logic_score >= 0 AND side_a_logic_score <= 100),
  side_a_evidence_score INTEGER CHECK (side_a_evidence_score >= 0 AND side_a_evidence_score <= 100),
  side_a_persuasion_score INTEGER CHECK (side_a_persuasion_score >= 0 AND side_a_persuasion_score <= 100),
  side_b_logic_score INTEGER CHECK (side_b_logic_score >= 0 AND side_b_logic_score <= 100),
  side_b_evidence_score INTEGER CHECK (side_b_evidence_score >= 0 AND side_b_evidence_score <= 100),
  side_b_persuasion_score INTEGER CHECK (side_b_persuasion_score >= 0 AND side_b_persuasion_score <= 100),
  winner TEXT CHECK (winner IN ('a', 'b', 'tie')),
  reasoning TEXT NOT NULL,
  blockchain_tx_hash TEXT,
  blockchain_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.debate_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view results"
  ON public.debate_results FOR SELECT
  USING (true);

-- Enable realtime for debates and arguments
ALTER PUBLICATION supabase_realtime ADD TABLE public.debates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_arguments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_results;

-- Create function to update profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();