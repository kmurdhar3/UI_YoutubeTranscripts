'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Megaphone, Video, Newspaper, GraduationCap, Check } from 'lucide-react';

const useCases = [
  {
    id: 'marketers',
    label: 'Marketers',
    icon: Megaphone,
    title: 'Transform Video Content into Marketing Gold',
    description: 'Turn competitor analysis, trend research, and campaign planning into actionable insights.',
    benefits: [
      'Extract competitor video strategies in seconds',
      'Repurpose video content into blog posts and social media',
      'Analyze trending content for campaign ideas',
      'Create SEO-optimized content from video transcripts'
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
  },
  {
    id: 'creators',
    label: 'Content Creators',
    icon: Video,
    title: 'Supercharge Your Content Workflow',
    description: 'Repurpose, optimize, and expand your reach with effortless transcript extraction.',
    benefits: [
      'Turn videos into blog posts and articles instantly',
      'Create show notes and descriptions automatically',
      'Generate social media snippets and quotes',
      'Improve accessibility with captions and subtitles'
    ],
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80'
  },
  {
    id: 'journalists',
    label: 'Journalists',
    icon: Newspaper,
    title: 'Research and Verify Sources Faster',
    description: 'Get accurate quotes, timestamps, and context from video interviews and press conferences.',
    benefits: [
      'Extract accurate quotes with timestamps',
      'Verify statements and fact-check efficiently',
      'Archive and search video content easily',
      'Meet tight deadlines with instant transcripts'
    ],
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'
  },
  {
    id: 'researchers',
    label: 'Researchers',
    icon: GraduationCap,
    title: 'Analyze Data at Scale',
    description: 'Extract and analyze large volumes of video data for qualitative and quantitative research.',
    benefits: [
      'Process hundreds of interviews efficiently',
      'Extract data for qualitative analysis',
      'Search and categorize video content',
      'Cite sources with accurate timestamps'
    ],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'
  }
];

export default function UseCasesCarousel() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Built for Your Workflow
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From content creation to academic research, see how professionals use TranscriptX.
          </p>
        </div>

        <Tabs defaultValue="marketers" className="max-w-6xl mx-auto">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full mb-12 h-auto">
            {useCases.map((useCase) => (
              <TabsTrigger 
                key={useCase.id} 
                value={useCase.id}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <useCase.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{useCase.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {useCases.map((useCase) => (
            <TabsContent key={useCase.id} value={useCase.id}>
              <Card>
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                          <useCase.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
                          {useCase.title}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-8">
                          {useCase.description}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        {useCase.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative h-64 lg:h-auto min-h-[400px]">
                      <img 
                        src={useCase.image} 
                        alt={useCase.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-r-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
