ALTER TABLE public.transcript_history
ADD COLUMN IF NOT EXISTS transcript_json JSONB;
