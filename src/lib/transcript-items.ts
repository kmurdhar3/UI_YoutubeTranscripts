import { createClient } from '@/supabase/client';

export interface TranscriptItem {
  id: string;
  history_id: string;
  video_id: string;
  video_title: string | null;
  channel_name: string | null;
  transcript_text: string | null;
  transcript_json: any | null;
  created_at: string;
}

export async function saveTranscriptItems(items: Omit<TranscriptItem, 'id' | 'created_at'>[]) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transcript_items')
    .insert(items)
    .select();

  if (error) {
    console.error('Error saving transcript items:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function getTranscriptItems(historyId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transcript_items')
    .select('*')
    .eq('history_id', historyId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching transcript items:', error);
    return { success: false, error };
  }

  return { success: true, data };
}
