import Link from 'next/link';
import { Twitter, Linkedin, Github, Youtube, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Resources Column */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Resources</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="#" className="text-xs sm:text-sm text-muted-foreground transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-xs sm:text-sm text-muted-foreground transition-colors">API Reference</Link></li>
              <li><Link href="#" className="text-xs sm:text-sm text-muted-foreground transition-colors">Video Tutorials</Link></li>
              <li><Link href="#" className="text-xs sm:text-sm text-muted-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-xs sm:text-sm text-muted-foreground transition-colors">Use Cases</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-muted-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">GDPR</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Contact</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-muted-foreground transition-colors">Support</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">Discord Community</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">Feature Requests</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">Report a Bug</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-muted-foreground transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">Our Mission</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground transition-colors">Press Kit</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 sm:pt-8 border-t gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4 md:mb-0">
            <div className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              TranscriptX
            </div>
            <span className="text-muted-foreground text-xs sm:text-sm">
              © {currentYear} All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#" className="text-muted-foreground transition-colors">
              <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a href="#" className="text-muted-foreground transition-colors">
              <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a href="#" className="text-muted-foreground transition-colors">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a href="#" className="text-muted-foreground transition-colors">
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
