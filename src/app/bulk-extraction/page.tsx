"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/supabase/client";
import { saveTranscriptHistory, getTranscriptHistoryStats } from "@/lib/transcript-history";

export default function BulkExtractionPage() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user) {
        const stats = await getTranscriptHistoryStats(user.id);
        setHasReachedLimit(stats.total_downloads >= 25);
        
        if (stats.total_downloads >= 25) {
          alert("You've reached the free limit of 25 downloads. Please subscribe to continue using bulk extraction and CSV export features.");
          window.location.href = "/pricing";
        }
      }
    };
    fetchUser();
  }, []);

  const handleGetPlaylist = async () => {
    if (!playlistUrl.trim()) return;
    
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
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (userId) {
        await saveTranscriptHistory({
          user_id: userId,
          video_id: playlistUrl,
          video_title: `Channel/Playlist extraction`,
          download_type: 'channel',
          transcript_text: JSON.stringify(data).substring(0, 1000),
          transcript_json: data,
          total_videos: data.count || 1
        });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
      setError(null);
    } else {
      setError('Please drop a valid CSV file');
    }
  };

  const handleUploadClick = () => {
    document.getElementById('csv-upload')?.click();
  };

  const handleFetchTranscripts = async () => {
    if (!csvFile) return;
    
    setCsvLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      
      console.log('Uploading CSV file:', csvFile.name);
      
      const res = await fetch('https://brightdata-api-951447856798.us-central1.run.app/transcribe-csv', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 2d0f15c9e903030daf1453ba70201c4da9bde54ba908d3ea63b3b287276c5cbe'
        },
        body: formData
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (userId) {
        await saveTranscriptHistory({
          user_id: userId,
          video_id: csvFile.name,
          video_title: `CSV Batch extraction: ${csvFile.name}`,
          download_type: 'csv',
          transcript_text: JSON.stringify(data).substring(0, 1000),
          transcript_json: data,
          total_videos: data.count || 1
        });
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcripts-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Transcripts downloaded successfully!');
      setCsvFile(null); // Clear file after successful download
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error:', err);
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Experimental Feature</h3>
            <p className="text-sm text-amber-800">
              This feature is experimental and may need some <Link href="/feedback" className="text-amber-900 underline">feedback</Link> to improve.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              Error: {error}
            </div>
          )}
          
          <div className="flex items-start gap-4 mb-6">
            <Input
              type="text"
              placeholder="https://www.youtube.com/watch?list=PLSq76P-lbX8X3puPt35ay2EFxwl"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              className="bg-pink-500 hover:bg-pink-600 text-white px-6"
              onClick={handleGetPlaylist}
              disabled={playlistLoading}
            >
              {playlistLoading ? 'Loading...' : 'Get Playlist'}
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            You can get create a Channel Playlist from any YouTube Channel by <Link href="#" className="text-pink-500 underline">extracting the Channel ID</Link>.
          </p>

          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">or</p>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div 
              className={`border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-pink-500 bg-pink-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <p className="text-gray-600">
                {csvFile 
                  ? `Selected: ${csvFile.name}` 
                  : "Drag 'n' drop a CSV file here, or click to upload"
                }
              </p>
            </div>
            
            {csvFile && (
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-2 mt-6"
                onClick={handleFetchTranscripts}
                disabled={csvLoading}
              >
                {csvLoading ? 'Fetching...' : 'Fetch Transcripts'}
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-6">
            Fetching transcripts in bulk (from a playlist or CSV), requires tokens. One transcript equals one token. You can purchase tokens from the <Link href="/pricing" className="text-pink-500 underline">pricing</Link> page.
          </p>
        </div>
      </div>
    </div>
  );
}
