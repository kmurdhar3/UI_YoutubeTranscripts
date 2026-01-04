'use client'

import { Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Marketing Manager",
    company: "TechFlow",
    quote: "TranscriptX has completely transformed how we repurpose video content. What used to take hours now takes minutes. It's become an essential tool in our content workflow.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
  },
  {
    name: "Marcus Rodriguez",
    role: "YouTube Creator",
    company: "450K Subscribers",
    quote: "The accuracy is incredible. I use it for all my video descriptions and blog posts. The AI summary feature is a game-changer for creating show notes.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
  },
  {
    name: "Dr. Emily Watson",
    role: "Research Professor",
    company: "Stanford University",
    quote: "As someone who analyzes hundreds of video interviews, TranscriptX has saved me countless hours. The timestamp accuracy is perfect for academic citations.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
  },
  {
    name: "James Park",
    role: "Podcast Producer",
    company: "Top 100 Business Podcast",
    quote: "We use TranscriptX for every episode. The clean formatting and multiple export options make it incredibly versatile. Worth every penny... except it's free!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
  }
];

export default function SocialProof() {
  return (
    <section className="py-24 sm:py-32 noise-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-accent text-accent" />
            ))}
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Loved by 50,000+ Users
          </h2>
          <p className="text-xl text-muted-foreground mb-2">
            4.9 out of 5 from 2,340 reviews
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                
                <p className="text-sm leading-relaxed mb-6 text-foreground">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
