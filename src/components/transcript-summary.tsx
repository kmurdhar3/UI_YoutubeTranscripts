"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getTranscriptHistory, 
  getTranscriptJson,
  type TranscriptHistoryEntry
} from "@/lib/transcript-history";
import { getTranscriptItems, type TranscriptItem } from "@/lib/transcript-items";
import { FileText, Calendar, ChevronLeft, Copy, Check, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TranscriptSummaryProps {
  userId: string;
}

export function TranscriptSummary({ userId }: TranscriptSummaryProps) {
  const [history, setHistory] = useState<TranscriptHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TranscriptHistoryEntry | null>(null);
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TranscriptItem | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [summaryLoading, setSummaryLoading] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'transcript' | 'summary'>('transcript');
  const [summaryContent, setSummaryContent] = useState<string>("");

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    setLoading(true);
    const historyResult = await getTranscriptHistory(userId);
    
    if (historyResult.success) {
      setHistory(historyResult.data);
    }
    setLoading(false);
  };

  const handleEntryClick = async (entry: TranscriptHistoryEntry) => {
    setSelectedEntry(entry);
    setSelectedItem(null);
    setTranscriptContent("");
    setViewMode('transcript');
    setSummaryContent("");
    
    if (entry.id) {
      const itemsResult = await getTranscriptItems(entry.id);
      if (itemsResult.success && itemsResult.data) {
        setTranscriptItems(itemsResult.data);
        
        // If single transcript (not bulk), load it directly
        if (itemsResult.data.length === 1) {
          const item = itemsResult.data[0];
          setSelectedItem(item);
          
          // Load the transcript content
          if (item.transcript_json?.transcript_text) {
            setTranscriptContent(item.transcript_json.transcript_text);
          } else if (item.transcript_text) {
            setTranscriptContent(item.transcript_text);
          } else if (item.transcript_json) {
            setTranscriptContent(JSON.stringify(item.transcript_json, null, 2));
          }
        } else if (itemsResult.data.length === 0 && entry.transcript_text) {
          // Fallback to transcript_text if no items
          setTranscriptContent(entry.transcript_text);
        }
      }
    }
  };

  const handleItemClick = async (item: TranscriptItem) => {
    setSelectedItem(item);
    setViewMode('transcript');
    setSummaryContent("");
    
    if (item.transcript_json?.transcript_text) {
      setTranscriptContent(item.transcript_json.transcript_text);
    } else if (item.transcript_text) {
      setTranscriptContent(item.transcript_text);
    } else if (item.transcript_json) {
      setTranscriptContent(JSON.stringify(item.transcript_json, null, 2));
    }
  };

  const handleBack = () => {
    if (selectedItem) {
      setSelectedItem(null);
      setTranscriptContent("");
      setViewMode('transcript');
      setSummaryContent("");
    } else {
      setSelectedEntry(null);
      setTranscriptItems([]);
    }
  };

  const handleCopy = async () => {
    const contentToCopy = viewMode === 'summary' ? summaryContent : transcriptContent;
    await navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    const contentToDownload = viewMode === 'summary' ? summaryContent : transcriptContent;
    const fileName = viewMode === 'summary' 
      ? `${selectedItem?.video_title || selectedEntry?.video_title || 'summary'}-summary.txt`
      : `${selectedItem?.video_title || selectedEntry?.video_title || 'transcript'}.txt`;
    
    const blob = new Blob([contentToDownload], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const filteredItems = transcriptItems.filter(item => 
    item.video_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.video_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateSummary = async (historyId: string, entry?: TranscriptHistoryEntry) => {
    setSummaryLoading(historyId);
    setSummaryError(null);
    
    try {
      const response = await fetch('https://youtube-summarizer-tppdr4jvfq-uc.a.run.app/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history_id: historyId,
          user_id: userId,
          summary_type: 'bullet_points',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to generate summary: ${response.status}`);
      }

      const data = await response.json();
      console.log('Summary API response:', data);
      
      // Set the summary content and switch to summary view
      if (data.summaries) {
        // Handle if summaries is an array of objects with summary and video_title
        let summaryText = '';
        if (Array.isArray(data.summaries)) {
          summaryText = data.summaries.map((item: { summary?: string; video_title?: string }) => {
            if (typeof item === 'string') return item;
            return item.video_title ? `## ${item.video_title}\n\n${item.summary}` : item.summary;
          }).join('\n\n---\n\n');
        } else if (typeof data.summaries === 'object' && data.summaries.summary) {
          summaryText = data.summaries.summary;
        } else if (typeof data.summaries === 'string') {
          summaryText = data.summaries;
        } else {
          summaryText = JSON.stringify(data.summaries, null, 2);
        }
        setSummaryContent(summaryText);
        setViewMode('summary');
        
        // If entry is provided, set it as selected to show the summary view
        if (entry) {
          setSelectedEntry(entry);
          // Create a virtual item to display the summary
          setSelectedItem({
            id: entry.id,
            history_id: entry.id,
            video_id: entry.video_id || '',
            video_title: entry.video_title,
            channel_name: entry.channel_name,
            created_at: entry.created_at || new Date().toISOString(),
          } as TranscriptItem);
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaryError('Failed to generate summary. Please try again.');
    } finally {
      setSummaryLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground500">Loading transcripts...</div>
      </div>
    );
  }

  // Show transcript reader view
  if (selectedItem && (transcriptContent || summaryContent)) {
    const displayContent = viewMode === 'summary' ? summaryContent : transcriptContent;
    const title = viewMode === 'summary' 
      ? `Summary: ${selectedItem.video_title || 'Transcript'}`
      : selectedItem.video_title || 'Transcript';
    
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground600 hover:text-muted-foreground900"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to transcripts
        </Button>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              {selectedItem.channel_name && (
                <p className="text-sm text-muted-foreground500">Channel: {selectedItem.channel_name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
              {displayContent}
            </pre>
          </div>
        </Card>
      </div>
    );
  }

  // Show transcript items list (for bulk downloads)
  if (selectedEntry && transcriptItems.length > 1) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground600 hover:text-muted-foreground900"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to history
        </Button>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-muted-foreground900">
              {selectedEntry.video_title || 'Transcripts'} ({transcriptItems.length} videos)
            </h2>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground400" />
            <Input
              type="text"
              placeholder="Search transcripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {item.video_title || item.video_id}
                  </h3>
                  {item.channel_name && (
                    <p className="text-sm text-muted-foreground500">{item.channel_name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateSummary(selectedEntry.id, selectedEntry);
                    }}
                    disabled={summaryLoading === selectedEntry.id}
                  >
                    {summaryLoading === selectedEntry.id ? 'Generating...' : 'Generate Summary'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Show single transcript reader (for non-bulk)
  if (selectedEntry && transcriptItems.length === 1 && (transcriptContent || summaryContent)) {
    const displayContent = viewMode === 'summary' ? summaryContent : transcriptContent;
    const title = viewMode === 'summary' 
      ? `Summary: ${selectedEntry.video_title || 'Transcript'}`
      : selectedEntry.video_title || 'Transcript';
    
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground600 hover:text-muted-foreground900"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to history
        </Button>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              {selectedEntry.channel_name && (
                <p className="text-sm text-muted-foreground500">Channel: {selectedEntry.channel_name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
              {displayContent}
            </pre>
          </div>
        </Card>
      </div>
    );
  }

  // Show history list
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Read Transcripts</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground500">No transcripts yet</p>
            <p className="text-sm text-muted-foreground400 mt-2">
              Extract transcripts to read them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 border border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleEntryClick(entry)}
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getTypeColor(entry.download_type)}>
                      {entry.download_type}
                    </Badge>
                    {entry.created_at && (
                      <span className="text-xs text-muted-foreground500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                      </span>
                    )}
                  </div>
                  
                  {entry.video_title && (
                    <h3 className="font-semibold mb-1 truncate">
                      {entry.video_title}
                    </h3>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground600">
                    {entry.channel_name && (
                      <span>Channel: {entry.channel_name}</span>
                    )}
                    {entry.total_videos && entry.total_videos > 1 && (
                      <span>{entry.total_videos} videos</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateSummary(entry.id, entry);
                    }}
                    disabled={summaryLoading === entry.id}
                  >
                    {summaryLoading === entry.id ? 'Generating...' : 'Generate Summary'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
