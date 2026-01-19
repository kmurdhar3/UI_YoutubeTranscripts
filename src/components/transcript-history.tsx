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
    if (entry.transcript_json && entry.id) {
      const result = await getTranscriptJson(entry.id, userId);
      if (result.success && result.data?.transcript_json) {
        const jsonData = result.data.transcript_json;
        
        // Check if this is a ZIP-type entry (channel or CSV extraction)
        if (jsonData.type === 'zip') {
          // Fetch individual transcript items from the database
          const itemsResult = await getTranscriptItems(entry.id);
          
          if (itemsResult.success && itemsResult.data && itemsResult.data.length > 0) {
            // Create a new ZIP file from the stored transcript items
            // Use the same format as the original download
            const zip = new JSZip();
            
            itemsResult.data.forEach((item, index) => {
              // Sanitize filename - remove invalid characters
              const sanitizedTitle = (item.video_title || item.video_id || `transcript_${index + 1}`)
                .replace(/[<>:"/\\|?*]/g, '_')
                .substring(0, 100);
              const fileName = `${sanitizedTitle}.json`;
              
              // Use stored transcript_json directly if available, otherwise reconstruct
              // This ensures we output the same format that was originally saved
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
            
            // Generate ZIP with compression to match original file size
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
            alert(`This ZIP file download doesn't have individual transcripts stored. This may be an older entry. Please run the extraction again.`);
            return;
          }
        }
        
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
      single: 'bg-blue-100 text-blue-800',
      batch: 'bg-purple-100 text-purple-800',
      channel: 'bg-green-100 text-green-800',
      csv: 'bg-orange-100 text-orange-800',
      playlist: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_downloads}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Most Used Type</p>
                <p className="text-xl font-semibold text-gray-900 capitalize">
                  {Object.entries(stats.downloads_by_type).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Activity</p>
                <p className="text-xl font-semibold text-gray-900">{stats.recent_downloads.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* History List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Download History</h2>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Download className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No download history yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Your transcript downloads will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(entry)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getTypeColor(entry.download_type)}>
                      {entry.download_type}
                    </Badge>
                    {entry.created_at && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                      </span>
                    )}
                  </div>
                  
                  {entry.video_title && (
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {entry.video_title}
                    </h3>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {entry.channel_name && (
                      <span>Channel: {entry.channel_name}</span>
                    )}
                    {entry.video_id && (
                      <span className="font-mono text-xs">ID: {entry.video_id}</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    entry.id && handleDelete(entry.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
