'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Wrench } from 'lucide-react'

export function ApiDocsDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        className="text-sm font-medium transition-colors cursor-pointer hover:text-foreground"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        type="button"
      >
        API Documentation
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
              We&apos;re working on something great!
            </DialogTitle>
            <DialogDescription className="text-center pt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              This feature is currently under development. We&apos;ll have it ready for you soon.
              <br />
              <br />
              Thank you for your patience!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ApiDocsDialogDisabled() {
  return (
    <span
      className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      API Documentation
    </span>
  )
}
