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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
            Ready to Extract Your First Transcript?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of content creators, marketers, and researchers who save hours every week with TranscriptX.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-xl shadow-lg border">
              <Input 
                placeholder="Paste your YouTube URL..." 
                className="flex-1 border-0 focus-visible:ring-0 text-lg h-14"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button size="lg" className="h-14 px-8 text-base font-medium hover:scale-[0.98] transition-transform" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Extract Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a 
              href="https://discord.gg/transcriptx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" size="lg" className="gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <MessageCircle className="w-5 h-5" />
                Join Our Discord Community
              </Button>
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            No sign up required • Extract unlimited transcripts • 100% free
          </p>
        </div>
      </div>
    </section>
  );
}
