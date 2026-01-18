import { createClient } from '@/supabase/server'
import { getTranscriptHistoryStats } from '@/lib/transcript-history'
import NavbarClient from './navbar-client'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let totalDownloads = 0
  if (user) {
    const stats = await getTranscriptHistoryStats(user.id)
    totalDownloads = stats.total_downloads
  }
  
  const hasReachedLimit = totalDownloads >= 25

  return <NavbarClient user={user} hasReachedLimit={hasReachedLimit} />
}
