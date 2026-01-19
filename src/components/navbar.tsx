import { createClient } from '@/supabase/server'
import NavbarClient from './navbar-client'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let totalDownloads = 0
  if (user) {
    // Fetch transcript history stats directly using server supabase client
    const { data, error } = await supabase
      .from('transcript_history')
      .select('total_videos')
      .eq('user_id', user.id)
    
    if (data && !error) {
      totalDownloads = data.reduce((sum, entry) => {
        return sum + (entry.total_videos || 1)
      }, 0)
    }
  }
  
  const hasReachedLimit = totalDownloads >= 25

  return <NavbarClient user={user} hasReachedLimit={hasReachedLimit} />
}
