'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, FileText } from 'lucide-react'
import { createClient } from '@/supabase/client'
import { saveTranscriptHistory } from '@/lib/transcript-history'

interface CSVExportDialogProps {
  children?: React.ReactNode
}

export function CSVExportDialog({ children }: CSVExportDialogProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      setError(null)
    } else {
      setError('Please upload a valid CSV file')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      setError(null)
    } else {
      setError('Please drop a valid CSV file')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUploadClick = () => {
    document.getElementById('csv-export-upload')?.click()
  }

  const handleFetchTranscripts = async () => {
    if (!csvFile) return
    
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      
      const res = await fetch('https://brightdata-api-951447856798.us-central1.run.app/transcribe-csv', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 2d0f15c9e903030daf1453ba70201c4da9bde54ba908d3ea63b3b287276c5cbe'
        },
        body: formData
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      // Save to history
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const videoCount = Array.isArray(data) ? data.length : 1
        await saveTranscriptHistory({
          user_id: user.id,
          video_id: `csv_batch_${Date.now()}`,
          video_title: csvFile.name,
          channel_name: 'CSV Batch Export',
          transcript_json: data,
          download_type: 'csv',
          total_videos: videoCount
        })
      }
      
      // Download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transcripts_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert('Transcripts downloaded successfully!')
      setCsvFile(null)
      setOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Fraunces, serif' }}>CSV Export</DialogTitle>
          <DialogDescription>
            Upload a CSV file with YouTube URLs to extract transcripts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleUploadClick}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <input
              type="file"
              id="csv-export-upload"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {csvFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto text-primary" />
                <p className="text-sm font-medium">{csvFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(csvFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag 'n' drop a CSV file here, or click to upload
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleFetchTranscripts}
            disabled={!csvFile || loading}
            className="w-full"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {loading ? 'Processing...' : 'Extract Transcripts'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
