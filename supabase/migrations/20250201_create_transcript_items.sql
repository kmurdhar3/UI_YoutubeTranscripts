CREATE TABLE IF NOT EXISTS transcript_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  history_id UUID NOT NULL REFERENCES transcript_history(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT,
  channel_name TEXT,
  transcript_text TEXT,
  transcript_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transcript_items_history_id ON transcript_items(history_id);
CREATE INDEX IF NOT EXISTS idx_transcript_items_video_id ON transcript_items(video_id);

ALTER TABLE transcript_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transcript items" ON transcript_items;
CREATE POLICY "Users can view their own transcript items"
  ON transcript_items FOR SELECT
  USING (
    history_id IN (
      SELECT id FROM transcript_history WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own transcript items" ON transcript_items;
CREATE POLICY "Users can insert their own transcript items"
  ON transcript_items FOR INSERT
  WITH CHECK (
    history_id IN (
      SELECT id FROM transcript_history WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own transcript items" ON transcript_items;
CREATE POLICY "Users can delete their own transcript items"
  ON transcript_items FOR DELETE
  USING (
    history_id IN (
      SELECT id FROM transcript_history WHERE user_id = auth.uid()
    )
  );
