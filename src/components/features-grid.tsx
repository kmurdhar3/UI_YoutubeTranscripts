import { Download, Zap, Sparkles, Globe, FileText, Wand2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Extract transcripts in seconds. No waiting, no hassle. Just instant results every time."
  },
  {
    icon: Download,
    title: "100% Free",
    description: "No hidden fees, no subscription required. Extract as many transcripts as you need, absolutely free."
  },
  {
    icon: Sparkles,
    title: "AI Summarization",
    description: "Get instant AI-powered summaries and key points from any transcript with one click."
  },
  {
    icon: Globe,
    title: "Universal Compatibility",
    description: "Works with any YouTube video. Supports all languages and automatic captions."
  },
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Export as TXT, SRT, VTT, or JSON. Perfect for any workflow or application."
  },
  {
    icon: Wand2,
    title: "Clean Output",
    description: "Perfectly formatted transcripts with timestamps, speaker labels, and punctuation."
  }
];

export default function FeaturesGrid() {
  return (
    <section className="py-24 sm:py-32 noise-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade transcript extraction with features that make your workflow seamless.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/20"
            >
              <CardContent className="p-8">
                <div className="mb-6 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
