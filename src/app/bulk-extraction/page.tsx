"use client";

import { useState, useEffect } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/supabase/client";
import { saveTranscriptHistory, getTranscriptHistoryStats } from "@/lib/transcript-history";
import { saveTranscriptItems } from "@/lib/transcript-items";

export default function BulkExtractionPage() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user) {
        const stats = await getTranscriptHistoryStats(user.id);
        const reachedLimit = stats.total_downloads >= 25;
        setHasReachedLimit(reachedLimit);
        
        if (reachedLimit) {
          alert("You've reached the free limit of 25 downloads. Please subscribe to continue using bulk extraction and CSV export features.");
          window.location.href = "/pricing";
        }
      }
    };
    fetchUser();
  }, []);

  const handleGetPlaylist = async () => {
    if (!playlistUrl.trim()) return;
    
    if (hasReachedLimit) {
      alert("You've reached the free limit of 25 downloads. Please subscribe to continue.");
      window.location.href = "/pricing";
      return;
    }
    
    setPlaylistLoading(true);
    setError(null);
    
    try {
      console.log('Sending request to API with URL:', playlistUrl);
      
      const res = await fetch('https://brightdata-api-951447856798.us-central1.run.app/transcribe-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 2d0f15c9e903030daf1453ba70201c4da9bde54ba908d3ea63b3b287276c5cbe'
        },
        body: JSON.stringify({
          channel_url: playlistUrl
        })
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Get the content type to determine if it's a ZIP file
      const contentType = res.headers.get('content-type') || '';
      const isZip = contentType.includes('application/zip') || contentType.includes('application/octet-stream');
      
      // Try to get the video count from response headers (case-insensitive)
      // Log all headers for debugging
      console.log('Response headers:');
      res.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      
      let videoCount = 1;
      
      // Try x-total-videos header first
      const videoCountHeader = res.headers.get('x-total-videos') || res.headers.get('X-Total-Videos') || res.headers.get('x-video-count');
      console.log('Video count header value:', videoCountHeader);
      
      if (videoCountHeader) {
        videoCount = parseInt(videoCountHeader, 10);
      } else {
        // Fallback: try to extract from content-disposition filename (e.g., "csv_sample_urls_4of4videos_...")
        const contentDisposition = res.headers.get('content-disposition') || '';
        console.log('Content-Disposition:', contentDisposition);
        const filenameMatch = contentDisposition.match(/(\d+)of(\d+)videos/);
        if (filenameMatch) {
          videoCount = parseInt(filenameMatch[2], 10); // Get total from "Xof<total>videos"
          console.log('Extracted video count from filename:', videoCount);
        }
      }
      
      console.log('Final video count:', videoCount);
      
      if (isZip) {
        // Handle ZIP file response
        const blob = await res.blob();
        console.log('Received ZIP file, size:', blob.size, 'video count:', videoCount);
        
        let historyId: string | null = null;
        
        if (userId) {
          // Extract ZIP contents to store individual transcripts
          const zip = new JSZip();
          const zipData = await zip.loadAsync(blob);
          const transcriptItems: Omit<import('@/lib/transcript-items').TranscriptItem, 'id' | 'created_at'>[] = [];
          
          // Save history entry first
          const historyResult = await saveTranscriptHistory({
            user_id: userId,
            video_id: playlistUrl,
            video_title: `Channel/Playlist extraction`,
            download_type: 'channel',
            transcript_text: 'ZIP file download',
            transcript_json: { type: 'zip', size: blob.size, count: videoCount },
            total_videos: videoCount
          });
          
          if (!historyResult.success) {
            console.error('Failed to save transcript history:', historyResult.error);
            alert('Transcript downloaded but failed to save to history. Please check your authentication.');
          }
          
          if (historyResult.success && historyResult.data) {
            historyId = historyResult.data.id;
            console.log('Transcript history saved with ID:', historyId);
            
            // Extract each file from ZIP
            for (const [filename, file] of Object.entries(zipData.files)) {
              if (!file.dir) {
                const content = await file.async('text');
                
                try {
                  const transcriptData = JSON.parse(content);
                  
                  // Extract transcript text from various possible formats
                  let transcriptText = transcriptData.transcript_text || transcriptData.transcript || null;
                  
                  // If transcript is an array of segments, join them
                  if (!transcriptText && Array.isArray(transcriptData.transcript)) {
                    transcriptText = transcriptData.transcript.map((seg: any) => seg.text || '').join(' ');
                  }
                  
                  // If segments array exists, try that
                  if (!transcriptText && Array.isArray(transcriptData.segments)) {
                    transcriptText = transcriptData.segments.map((seg: any) => seg.text || '').join(' ');
                  }
                  
                  console.log('Parsing transcript file:', filename, 'transcript_text length:', transcriptText?.length || 0);
                  
                  transcriptItems.push({
                    history_id: historyId!,
                    video_id: transcriptData.video_id || filename,
                    video_title: transcriptData.title || transcriptData.video_title || filename,
                    channel_name: transcriptData.channel_name || null,
                    transcript_text: transcriptText,
                    transcript_json: transcriptData
                  });
                } catch (e) {
                  console.error('Error parsing transcript file:', filename, e);
                }
              }
            }
            
            // Save all transcript items
            if (transcriptItems.length > 0) {
              await saveTranscriptItems(transcriptItems);
            }
          }
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcripts-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Handle JSON response
        const data = await res.json();
        console.log('API Response:', data);
        
        if (userId) {
          const historyResult = await saveTranscriptHistory({
            user_id: userId,
            video_id: playlistUrl,
            video_title: `Channel/Playlist extraction`,
            download_type: 'channel',
            transcript_text: JSON.stringify(data).substring(0, 1000),
            transcript_json: data,
            total_videos: data.count || 1
          });
          
          if (!historyResult.success) {
            console.error('Failed to save transcript history:', historyResult.error);
          } else {
            console.log('Transcript history saved successfully');
          }
        } else {
          console.warn('User not authenticated, cannot save transcript history');
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      alert('File downloaded successfully!');
      setPlaylistUrl(''); // Clear input field after successful download
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error:', err);
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setPlaylistLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back to Home</span>
        </Link>
        
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 flex items-start gap-2 sm:gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1 text-sm sm:text-base">Experimental Feature</h3>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
              This feature is experimental and may need some <Link href="/feedback" className="text-amber-900 dark:text-amber-100 underline">feedback</Link> to improve.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              Error: {error}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Input
              type="text"
              placeholder="https://www.youtube.com/watch?list=..."
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className="flex-1 text-sm sm:text-base"
            />
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap"
              onClick={handleGetPlaylist}
              disabled={playlistLoading}
            >
              {playlistLoading ? 'Loading...' : 'Get Playlist'}
            </Button>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            You can get create a Channel Playlist from any YouTube Channel by <Link href="#" className="text-primary underline">extracting the Channel ID</Link>.
          </p>

          <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
            Fetching transcripts in bulk (from a playlist or CSV), requires tokens. One transcript equals one token. You can purchase tokens from the <Link href="/pricing" className="text-primary underline">pricing</Link> page.
          </p>
        </div>
      </div>
    </div>
  );
}
