import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import AccountClient from '@/components/account-client'

export default async function AccountPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  // Fetch user subscription details
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch transcript history count
  const { count: transcriptCount } = await supabase
    .from('transcript_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <AccountClient 
      user={user} 
      subscription={subscription}
      transcriptCount={transcriptCount || 0}
    />
  )
}
