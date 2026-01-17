'use client'

import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function FinalCTA() {
  const [url, setUrl] = useState('');

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden noise-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-600/10" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Ready to Extract Your First Transcript?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Join thousands of content creators, marketers, and researchers who save hours every week with TranscriptX.
          </p>

          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-1.5 sm:p-2 bg-card rounded-xl shadow-lg border">
              <Input 
                placeholder="Paste your YouTube URL..." 
                className="flex-1 border-0 focus-visible:ring-0 text-base sm:text-lg h-12 sm:h-14"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium whitespace-nowrap" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Extract Now
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-4">
            <a 
              href="https://discord.gg/transcriptx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto"
            >
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Join Our Discord Community
              </Button>
            </a>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            No sign up required • Extract unlimited transcripts • 100% free
          </p>
        </div>
      </div>
    </section>
  );
}
