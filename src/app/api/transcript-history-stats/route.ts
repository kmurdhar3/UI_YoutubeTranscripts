import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { getTranscriptHistoryStats } from '@/lib/transcript-history'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ total_downloads: 0 })
    }
    
    const stats = await getTranscriptHistoryStats(user.id)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching transcript history stats:', error)
    return NextResponse.json({ total_downloads: 0 })
  }
}
