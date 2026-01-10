CREATE TABLE IF NOT EXISTS public.transcript_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT,
  channel_name TEXT,
  transcript_text TEXT,
  download_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transcript_history_user_id ON public.transcript_history(user_id);
CREATE INDEX IF NOT EXISTS idx_transcript_history_created_at ON public.transcript_history(created_at DESC);

ALTER TABLE public.transcript_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own history" ON public.transcript_history;
CREATE POLICY "Users can view own history"
  ON public.transcript_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own history" ON public.transcript_history;
CREATE POLICY "Users can insert own history"
  ON public.transcript_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own history" ON public.transcript_history;
CREATE POLICY "Users can delete own history"
  ON public.transcript_history FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE public.transcript_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transcript_history;
