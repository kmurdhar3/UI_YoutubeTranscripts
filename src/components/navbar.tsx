import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { Button } from './ui/button'
import { Menu, Chrome, MessageCircle } from 'lucide-react'
import UserProfile from './user-profile'
import { ThemeSwitcher } from './theme-switcher'
import { CSVExportClient } from './csv-export-client'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" prefetch className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            TranscriptX
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              History
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Channel Info
            </Link>
            {user ? (
              <Link href="/bulk-extraction" className="text-sm font-medium hover:text-primary transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Bulk Extraction
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Bulk Extraction
              </span>
            )}
            {user ? (
              <CSVExportClient />
            ) : (
              <span className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                CSV Export
              </span>
            )}
            {user ? (
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                API
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                API
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <a href="#" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-5 h-5" />
          </a>
          <a href="#" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors">
            <Chrome className="w-5 h-5" />
          </a>
          <ThemeSwitcher />
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
