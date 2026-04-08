import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import PopularDestinations from "@/components/PopularDestinations";
import CTASection from "@/components/CTASection";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <div id="features">
        <FeaturesSection />
      </div>
      <PopularDestinations />
      <CTASection />
    </main>
  );
}
