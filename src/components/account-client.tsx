'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Calendar, Mail, Key, User as UserIcon, ArrowLeft } from 'lucide-react'
import { createClient } from '@/supabase/client'
import { useRouter } from 'next/navigation'

interface AccountClientProps {
  user: any
  subscription: any
  transcriptCount: number
}

export default function AccountClient({ user, subscription, transcriptCount }: AccountClientProps) {
  const router = useRouter()
  const [apiToken, setApiToken] = useState<string | null>(null)
  const [showToken, setShowToken] = useState(false)
  const supabase = createClient()

  const subscriptionQuota = subscription?.plan === 'free' ? 25 : subscription?.quota || 25
  const quotaResetDate = subscription?.quota_reset_date 
    ? new Date(subscription.quota_reset_date).toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'numeric', 
        year: 'numeric' 
      })
    : '2/1/2026'

  const generateApiToken = async () => {
    try {
      const token = `yt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      
      const { error } = await supabase
        .from('user_api_tokens')
        .upsert({
          user_id: user.id,
          token: token,
          created_at: new Date().toISOString()
        })

      if (!error) {
        setApiToken(token)
        setShowToken(true)
      }
    } catch (error) {
      console.error('Error generating API token:', error)
    }
  }

  useEffect(() => {
    const fetchApiToken = async () => {
      const { data } = await supabase
        .from('user_api_tokens')
        .select('token')
        .eq('user_id', user.id)
        .single()
      
      if (data?.token) {
        setApiToken(data.token)
      }
    }
    fetchApiToken()
  }, [user.id])

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 lg:py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
            My Account
          </h1>
        </div>

        {/* Subscription Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Fraunces, serif' }}>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current subscription:</p>
                <Badge variant="secondary" className="text-sm font-semibold">
                  {subscription?.plan || 'Free'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subscription usage:</p>
                <p className="text-lg font-semibold">{transcriptCount}/{subscriptionQuota}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="text-sm text-muted-foreground mb-1">Quota resets:</p>
                <p className="text-lg font-semibold">{quotaResetDate}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">API token:</p>
              </div>
              {showToken && apiToken ? (
                <div className="bg-muted p-3 rounded-md mb-4 overflow-x-auto">
                  <code className="text-xs sm:text-sm break-all">{apiToken}</code>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={generateApiToken}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  className="w-full sm:w-auto"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Generate API Token
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="bg-accent hover:bg-accent/90 w-full sm:w-auto"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                onClick={() => router.push('/pricing')}
              >
                Upgrade Subscription
              </Button>
              <Button 
                variant="outline"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                className="w-full sm:w-auto"
              >
                Manage Subscription
              </Button>
              <Button 
                variant="outline"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                className="w-full sm:w-auto"
              >
                Invoices
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage History Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Fraunces, serif' }}>Usage History</CardTitle>
            <CardDescription>
              Your (estimated) token usage across billing cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>No usage data available yet</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Fraunces, serif' }}>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Email:</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-base sm:text-lg font-medium break-all">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Created:</p>
                <p className="text-base sm:text-lg font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linked Sign-in Methods Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Fraunces, serif' }}>Linked Sign-in Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl font-bold">G</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Google</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.user_metadata?.full_name || 'User'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
