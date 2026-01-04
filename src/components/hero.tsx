'use client'

import Link from "next/link";
import { Star, Shield, Users } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState } from "react";

export default function Hero() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExtractTranscript = async () => {
    if (!url.trim()) {
      alert('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 2d0f15c9e903030daf1453ba70201c4da9bde54ba908d3ea63b3b287276c5cbe',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract transcript');
      }

      // Get the file from response
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'transcript.txt';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error extracting transcript:', error);
      alert('Failed to extract transcript. Please try again.');
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
            <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge variant="secondary" className="px-4 py-2 text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <Star className="w-4 h-4 mr-2 fill-accent text-accent" />
                Trusted by 50,000+ content creators
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-center mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100" style={{ fontFamily: 'Fraunces, serif' }}>
              Extract YouTube Transcripts{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Instantly
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto text-center leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Fast, reliable transcript extraction for content creators, marketers, and researchers. 
              Download in seconds, no signup required.
            </p>

            {/* URL Input Form */}
            <div className="max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-xl shadow-lg border">
                <Input 
                  placeholder="Paste YouTube URL here..." 
                  className="flex-1 border-0 focus-visible:ring-0 text-lg h-14"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base font-medium hover:scale-[0.98] transition-transform" 
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  onClick={handleExtractTranscript}
                  disabled={loading}
                >
                  {loading ? 'Extracting...' : 'Extract Transcript'}
                </Button>
              </div>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <Link href="/bulk-extraction">
                <Button variant="outline" size="lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Bulk Extraction
                </Button>
              </Link>
              <Link href="#api">
                <Button variant="ghost" size="lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  API Documentation →
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-background"></div>
                </div>
                <span className="font-medium">50,000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="font-medium">4.9/5 (2,340 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
