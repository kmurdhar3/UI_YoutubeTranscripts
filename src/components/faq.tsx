import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: "Is TranscriptX really free?",
    answer: "Yes! TranscriptX is completely free for basic transcript extraction. You can extract as many transcripts as you need without any hidden fees or subscription requirements. We also offer premium features for power users who need advanced functionality."
  },
  {
    question: "What video formats are supported?",
    answer: "TranscriptX works with any YouTube video that has captions or subtitles available. This includes auto-generated captions and manually uploaded subtitles in any language. We support public videos, unlisted videos (with link), and videos from your own channel."
  },
  {
    question: "How accurate are the transcripts?",
    answer: "Transcript accuracy depends on the quality of YouTube's captions. For videos with professional captions, accuracy is typically 95-99%. For auto-generated captions, accuracy varies based on audio quality, accents, and technical terminology. We preserve the exact text from YouTube without modification."
  },
  {
    question: "Can I extract transcripts from private videos?",
    answer: "TranscriptX can only extract transcripts from videos that are public or unlisted (with the link). Private videos are not accessible through our service. If you need to transcribe your own private videos, consider making them unlisted temporarily."
  },
  {
    question: "What export formats do you support?",
    answer: "We support multiple export formats including plain text (TXT), SubRip (SRT), WebVTT (VTT), and JSON. Each format preserves timestamps and can be customized based on your needs. Premium users can also access CSV and XML exports."
  },
  {
    question: "Do you have an API for bulk extraction?",
    answer: "Yes! Our API allows you to extract transcripts programmatically at scale. Perfect for researchers, developers, and businesses processing large volumes of video content. Check our API documentation for integration details and rate limits."
  },
  {
    question: "How do I use the AI summarization feature?",
    answer: "After extracting a transcript, click the 'Summarize' button to generate an AI-powered summary. Our AI identifies key points, main topics, and important quotes. This feature is available for all users and works best with transcripts longer than 5 minutes."
  },
  {
    question: "Is my data private and secure?",
    answer: "Absolutely. We use SSL encryption for all data transfers and don't store your transcripts permanently on our servers. Extracted transcripts are temporarily cached for performance but automatically deleted after 24 hours. We never share your data with third parties."
  }
];

export default function FAQ() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about TranscriptX. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-[1fr_300px] gap-8">
          <div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-card"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Still have questions?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Can't find the answer you're looking for? Our support team is here to help.
                  </p>
                </div>
                <Button className="w-full" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
