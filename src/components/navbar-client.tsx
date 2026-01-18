'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { Menu, Chrome, MessageCircle } from 'lucide-react'
import UserProfile from './user-profile'
import { ThemeSwitcher } from './theme-switcher'
import { CSVExportClient } from './csv-export-client'
import { ApiDocsDialog, ApiDocsDialogDisabled } from './api-docs-dialog'

interface NavbarClientProps {
  user: any
  hasReachedLimit: boolean
}

export default function NavbarClient({ user, hasReachedLimit }: NavbarClientProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 sm:h-16 flex justify-between items-center">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" prefetch className="text-lg sm:text-xl md:text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            TranscriptX
          </Link>
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link href="/history" className="text-sm font-medium transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              History
            </Link>
            {user && !hasReachedLimit ? (
              <Link href="/bulk-extraction" className="text-sm font-medium transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Bulk Extraction
              </Link>
            ) : user && hasReachedLimit ? (
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Bulk Extraction
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Bulk Extraction
              </span>
            )}
            {user && !hasReachedLimit ? (
              <CSVExportClient />
            ) : (
              <span className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                CSV Export
              </span>
            )}
            {user ? (
              <ApiDocsDialog />
            ) : (
              <ApiDocsDialogDisabled />
            )}
          </div>
        </div>
        
        <div className="flex gap-2 sm:gap-3 items-center">
          <a href="#" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
          <a href="#" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
            <Chrome className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
          <ThemeSwitcher />
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline-flex">
                <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
