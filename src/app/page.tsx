import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import FeaturesGrid from "@/components/features-grid";
import UseCasesCarousel from "@/components/use-cases-carousel";
import SocialProof from "@/components/social-proof";
import FAQ from "@/components/faq";
import FinalCTA from "@/components/final-cta";
import PricingCard from "@/components/pricing-card";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  const result = plans?.items;

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero className="w-[1511px] h-[711px]" />
      <FeaturesGrid />
      <UseCasesCarousel />
      <SocialProof />
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
