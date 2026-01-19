-- Reset and recreate users from auth.users
-- Step 1: Truncate dependent tables first (cascade)
TRUNCATE TABLE public.transcript_items CASCADE;
TRUNCATE TABLE public.transcript_history CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Step 2: Re-insert all auth users into public.users
INSERT INTO public.users (id, user_id, token_identifier, email, created_at, updated_at)
SELECT 
  au.id,
  au.id::text,
  au.id::text,
  au.email,
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  token_identifier = EXCLUDED.token_identifier,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Step 3: Ensure RLS policies are correct for transcript_history
DROP POLICY IF EXISTS "Users can view own history" ON public.transcript_history;
CREATE POLICY "Users can view own history"
  ON public.transcript_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own history" ON public.transcript_history;
CREATE POLICY "Users can insert own history"
  ON public.transcript_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own history" ON public.transcript_history;
CREATE POLICY "Users can update own history"
  ON public.transcript_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own history" ON public.transcript_history;
CREATE POLICY "Users can delete own history"
  ON public.transcript_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypass
DROP POLICY IF EXISTS "Service role full access" ON public.transcript_history;
CREATE POLICY "Service role full access"
  ON public.transcript_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
