'use client'

import { CSVExportDialog } from './csv-export-dialog'

export function CSVExportClient() {
  return (
    <CSVExportDialog>
      <button className="text-sm font-medium hover:text-primary transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        CSV Export
      </button>
    </CSVExportDialog>
  )
}
