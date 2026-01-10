'use client'

import Link from 'next/link'
import { createClient } from '@/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { UserCircle, Home, History, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardNavbar() {
  const supabase = createClient()
  const router = useRouter()

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" prefetch className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            TranscriptX
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/history" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <History className="w-4 h-4" />
              History
            </Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={async () => {
                await supabase.auth.signOut()
                router.refresh()
              }}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
