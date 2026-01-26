"use client";

import { useEffect, useState } from "react";
import JSZip from "jszip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getTranscriptHistory, 
  getTranscriptHistoryStats, 
  deleteTranscriptHistoryEntry,
  clearTranscriptHistory,
  getTranscriptJson,
  type TranscriptHistoryEntry,
  type TranscriptHistoryStats
} from "@/lib/transcript-history";
import { getTranscriptItems } from "@/lib/transcript-items";
import { Download, Trash2, Calendar, Video, TrendingUp } from "lucide-react";

interface TranscriptHistoryProps {
  userId: string;
}

export function TranscriptHistory({ userId }: TranscriptHistoryProps) {
  const [history, setHistory] = useState<TranscriptHistoryEntry[]>([]);
  const [stats, setStats] = useState<TranscriptHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    setLoading(true);
    const [historyResult, statsResult] = await Promise.all([
      getTranscriptHistory(userId),
      getTranscriptHistoryStats(userId)
    ]);
    
    if (historyResult.success) {
      setHistory(historyResult.data);
    }
    setStats(statsResult);
    setLoading(false);
  };

  const handleDelete = async (entryId: string) => {
    const result = await deleteTranscriptHistoryEntry(entryId, userId);
    if (result.success) {
      loadHistory();
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all history?')) {
      const result = await clearTranscriptHistory(userId);
      if (result.success) {
        loadHistory();
      }
    }
  };

  const handleRowClick = async (entry: TranscriptHistoryEntry) => {
    if (!entry.id) return;
    
    // First, try to fetch transcript items (works for both single and batch downloads)
    const itemsResult = await getTranscriptItems(entry.id);
    
    if (itemsResult.success && itemsResult.data && itemsResult.data.length > 0) {
      const items = itemsResult.data;
      
      // Check if this is a ZIP-type entry (channel, batch, or CSV extraction with multiple items)
      if (items.length > 1 || entry.download_type === 'channel' || entry.download_type === 'batch' || entry.download_type === 'csv') {
        // Create a ZIP file from the stored transcript items
        const zip = new JSZip();
        
        items.forEach((item, index) => {
          // Sanitize filename - remove invalid characters
          const sanitizedTitle = (item.video_title || item.video_id || `transcript_${index + 1}`)
            .replace(/[<>:"/\\|?*]/g, '_')
            .substring(0, 100);
          const fileName = `${sanitizedTitle}.json`;
          
          // Use stored transcript_json directly if available, otherwise reconstruct
          const content = item.transcript_json 
            ? JSON.stringify(item.transcript_json, null, 2)
            : JSON.stringify({
                video_id: item.video_id,
                video_title: item.video_title,
                channel_name: item.channel_name,
                transcript_text: item.transcript_text
              }, null, 2);
          zip.file(fileName, content);
        });
        
        // Generate ZIP with compression
        const zipBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${entry.video_title || entry.video_id || 'transcripts'}-${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      } else {
        // Single item - download as text file
        const item = items[0];
        const blob = new Blob([item.transcript_text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${item.video_title || item.video_id || 'transcript'}.txt`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    }
    
    // Fallback to old method for legacy entries without transcript_items
    if (entry.transcript_json) {
      const result = await getTranscriptJson(entry.id, userId);
      if (result.success && result.data?.transcript_json) {
        const jsonData = result.data.transcript_json;
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${entry.video_title || entry.video_id || 'transcript'}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } else if (entry.transcript_text) {
      const blob = new Blob([entry.transcript_text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entry.video_title || entry.video_id || 'transcript'}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      single: 'bg-blue-500/20 text-blue-400 dark:bg-blue-500/20 dark:text-blue-400',
      batch: 'bg-purple-500/20 text-purple-400 dark:bg-purple-500/20 dark:text-purple-400',
      channel: 'bg-green-500/20 text-green-400 dark:bg-green-500/20 dark:text-green-400',
      csv: 'bg-orange-500/20 text-orange-400 dark:bg-orange-500/20 dark:text-orange-400',
      playlist: 'bg-pink-500/20 text-pink-400 dark:bg-pink-500/20 dark:text-pink-400'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total_downloads}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Most Used Type</p>
                <p className="text-lg sm:text-xl font-semibold capitalize">
                  {Object.entries(stats.downloads_by_type).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Recent Activity</p>
                <p className="text-lg sm:text-xl font-semibold">{stats.recent_downloads.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* History List */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Generate Transcripts</h2>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Download className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No download history yet</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Your transcript downloads will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(entry)}
              >
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={getTypeColor(entry.download_type)}>
                      {entry.download_type}
                    </Badge>
                    {entry.created_at && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                      </span>
                    )}
                  </div>
                  
                  {entry.video_title && (
                    <h3 className="font-semibold mb-1 line-clamp-2 sm:truncate">
                      {entry.video_title}
                    </h3>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    {entry.channel_name && (
                      <span className="truncate">Channel: {entry.channel_name}</span>
                    )}
                    {entry.video_id && (
                      <span className="font-mono text-xs truncate">ID: {entry.video_id}</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(entry);
                  }}
                  className="w-full sm:w-auto whitespace-nowrap"
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
