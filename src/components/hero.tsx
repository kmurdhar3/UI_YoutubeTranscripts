"use client";

import Link from "next/link";
import { Star, Shield, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { saveTranscriptHistory, getTranscriptHistoryStats } from "@/lib/transcript-history";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user) {
        const stats = await getTranscriptHistoryStats(user.id);
        setTotalDownloads(stats.total_downloads);
        setHasReachedLimit(stats.total_downloads >= 25);
      }
    };
    fetchUser();
  }, []);

  const handleExtractTranscript = async () => {
    if (!url.trim()) {
      alert("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://brightdata-api-951447856798.us-central1.run.app/transcribe",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer 2d0f15c9e903030daf1453ba70201c4da9bde54ba908d3ea63b3b287276c5cbe",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to extract transcript");
      }

      const responseBlob = await response.blob();
      const transcriptText = await responseBlob.text();

      const videoIdMatch = url.match(/(?:v=|\/)([\w-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : "unknown";

      if (userId && transcriptText) {
        await saveTranscriptHistory({
          user_id: userId,
          video_id: videoId,
          video_title: `YouTube Video ${videoId}`,
          channel_name: null,
          transcript_text: transcriptText,
          download_type: "single",
          total_videos: 1,
        });
      }

      const textBlob = new Blob([transcriptText], { type: "text/plain" });
      const downloadUrl = window.URL.createObjectURL(textBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "transcript.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setUrl(""); // Clear input field after successful download
    } catch (error) {
      console.error("Error extracting transcript:", error);
      alert("Failed to extract transcript. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden noise-bg">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Trust badge */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <Badge
                variant="secondary"
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 fill-accent text-accent" />
                <span className="hidden sm:inline">Trusted by 1,000+ content creators</span>
                <span className="sm:hidden">1,000+ creators</span>
              </Badge>
            </div>

            {/* Headline */}
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-center mb-4 sm:mb-6 tracking-tight px-4"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Extract YouTube Transcripts{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Instantly
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto text-center leading-relaxed px-4">
              Fast, reliable transcript extraction for content creators,
              marketers, and researchers. Download in seconds, no signup
              required.
            </p>

            {/* URL Input Form */}
            <div className="max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-1.5 sm:p-2 bg-card rounded-xl shadow-lg border">
                <Input
                  placeholder="Paste YouTube URL here..."
                  className="flex-1 border-0 focus-visible:ring-0 text-base sm:text-lg h-12 sm:h-14"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  onClick={handleExtractTranscript}
                  disabled={loading}
                >
                  {loading ? "Extracting..." : "Extract Transcript"}
                </Button>
              </div>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
              {userId && !hasReachedLimit ? (
                <Link href="/bulk-extraction">
                  <Button
                    variant="outline"
                    size="lg"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    Bulk Extraction
                  </Button>
                </Link>
              ) : userId && hasReachedLimit ? (
                <Button
                  variant="outline"
                  size="lg"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  onClick={() => {
                    alert("You've reached the free limit of 25 downloads. Please subscribe to continue using bulk extraction and CSV export features.");
                    window.location.href = "/pricing";
                  }}
                >
                  Bulk Extraction
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Bulk Extraction
                </Button>
              )}
              {userId ? (
                <Link href="#api">
                  <Button
                    variant="ghost"
                    size="lg"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    API Documentation →
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="lg"
                  disabled
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  API Documentation →
                </Button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-background"></div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background"></div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-background"></div>
                </div>
                <span className="font-medium">1,000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="font-medium hidden sm:inline">4.9/5 (2,340 reviews)</span>
                <span className="font-medium sm:hidden">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
