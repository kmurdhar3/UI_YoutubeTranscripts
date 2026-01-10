ALTER TABLE public.transcript_history
ADD COLUMN IF NOT EXISTS total_videos INTEGER DEFAULT 1;
