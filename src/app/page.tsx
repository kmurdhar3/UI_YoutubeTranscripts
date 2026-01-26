import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import FeaturesGrid from "@/components/features-grid";
import UseCasesCarousel from "@/components/use-cases-carousel";
import SocialProof from "@/components/social-proof";
import FAQ from "@/components/faq";
import FinalCTA from "@/components/final-cta";
import PricingCard from "@/components/pricing-card";
import { createClient } from "@/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  // Filter to show only monthly plans
  const result = plans?.items?.filter((item: any) => 
    item.name?.toLowerCase().includes('monthly')
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <UseCasesCarousel />
      <SocialProof />
      
      {/* SEO Content Section - ADD THIS */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The Fastest Way to Extract YouTube Transcripts
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Extract, download, and analyze YouTube video transcripts in seconds. From single videos to bulk processing of 500+ videos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-base mb-4">
                <strong>Get YouTube Transcripts</strong> is a powerful tool that lets you extract, download, 
                and analyze YouTube video transcripts in seconds. Whether you need a single transcript 
                or want to process hundreds of videos at once, we make it simple and fast.
              </p>
              <p className="text-base mb-4">
                Our free tier allows unlimited single video transcript extraction without any login required. 
                Just paste a YouTube URL and download the transcript instantly. Perfect for students, 
                content creators, researchers, and anyone who needs quick access to video captions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-base mb-4">
                For power users, our premium features include bulk transcript extraction for up to 500 videos, 
                complete channel transcript downloads, CSV batch processing, and AI-powered transcript summaries. 
                Sign up today and get 25 free transcript downloads to try our premium features.
              </p>
              <p className="text-base mb-4">
                All transcripts are extracted directly from YouTube's official caption data, ensuring 
                accuracy and reliability. No browser extensions, no complicated setup - just paste and download.
              </p>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            Who Uses YouTube Transcript Extraction?
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                📚 Students & Educators
              </h4>
              <p className="text-gray-700">
                Extract transcripts from educational videos to create study notes, translate 
                lectures to different languages, or make content accessible for students with 
                hearing impairments. Perfect for online learning and MOOCs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                ✍️ Content Creators
              </h4>
              <p className="text-gray-700">
                Repurpose your YouTube videos into blog posts, social media content, or 
                ebooks. Extract transcripts from competitor videos for market research and 
                content strategy planning.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                🔬 Researchers
              </h4>
              <p className="text-gray-700">
                Analyze video content at scale for academic research, sentiment analysis, 
                or trend studies. Extract transcripts from hundreds of videos to build 
                datasets for machine learning projects.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                💼 Businesses
              </h4>
              <p className="text-gray-700">
                Monitor competitor content, analyze customer testimonials, create training 
                materials from video tutorials, or transcribe webinars and presentations 
                for documentation.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Start Extracting YouTube Transcripts Today
            </h3>
            <p className="text-lg mb-6 text-gray-700">
              Free for single videos • Premium plans from ₹999/month • 25 free downloads when you sign up
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#hero" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition inline-block"
              >
                Try Free Now
              </a>
              <a 
                href="#pricing" 
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition inline-block"
              >
                View Pricing
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      {result && result.length > 0 && (
        <section className="py-24 sm:py-32 noise-bg" id="pricing">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2
                className="text-4xl sm:text-5xl font-bold mb-4"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the perfect plan for your needs. Upgrade or downgrade at
                any time.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {result.map((item: any) => (
                <PricingCard key={item.id} item={item} user={user} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}