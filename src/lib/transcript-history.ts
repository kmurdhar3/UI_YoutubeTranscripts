import { createClient } from '@/supabase/client';

export interface TranscriptHistoryEntry {
  id?: string;
  user_id: string;
  video_id: string;
  video_title?: string;
  channel_name?: string;
  transcript_text?: string;
  transcript_json?: any;
  download_type: 'single' | 'batch' | 'channel' | 'csv' | 'playlist';
  total_videos?: number;
  created_at?: string;
}

export interface TranscriptHistoryStats {
  total_downloads: number;
  downloads_by_type: Record<string, number>;
  recent_downloads: TranscriptHistoryEntry[];
}

export async function saveTranscriptHistory(entry: Omit<TranscriptHistoryEntry, 'id' | 'created_at'>) {
  const supabase = createClient();
  
  // Check if user is authenticated first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('User not authenticated, cannot save transcript history:', authError);
    return { success: false, error: authError || new Error('User not authenticated') };
  }
  
  // Verify the user_id matches the authenticated user
  if (entry.user_id !== user.id) {
    console.error('User ID mismatch in transcript history');
    return { success: false, error: new Error('User ID mismatch') };
  }
  
  const { data, error } = await supabase
    .from('transcript_history')
    .insert(entry)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving transcript history:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

export async function getTranscriptHistory(userId: string, limit = 50) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('transcript_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching transcript history:', error);
    return { success: false, error, data: [] };
  }
  
  return { success: true, data: data || [] };
}

export async function getTranscriptHistoryStats(userId: string): Promise<TranscriptHistoryStats> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('transcript_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !data) {
    console.error('Error fetching transcript history stats:', error);
    return {
      total_downloads: 0,
      downloads_by_type: {},
      recent_downloads: []
    };
  }
  
  const downloads_by_type = data.reduce((acc, entry) => {
    const type = entry.download_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const total_downloads = data.reduce((sum, entry) => {
    return sum + (entry.total_videos || 1);
  }, 0);
  
  return {
    total_downloads,
    downloads_by_type,
    recent_downloads: data.slice(0, 10)
  };
}

export async function deleteTranscriptHistoryEntry(entryId: string, userId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('transcript_history')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting transcript history entry:', error);
    return { success: false, error };
  }
  
  return { success: true };
}

export async function clearTranscriptHistory(userId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('transcript_history')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error clearing transcript history:', error);
    return { success: false, error };
  }
  
  return { success: true };
}

export async function getTranscriptJson(entryId: string, userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('transcript_history')
    .select('transcript_json, video_title, created_at')
    .eq('id', entryId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching transcript JSON:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}
