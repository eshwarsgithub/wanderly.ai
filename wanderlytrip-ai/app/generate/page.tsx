import Navbar from "@/components/Navbar";
import TripForm from "@/components/TripForm";
import { Sparkles } from "lucide-react";

export default function GeneratePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Background aurora */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-15"
          style={{
            background: "radial-gradient(ellipse, #00f5d4, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 pt-28 pb-20 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#00f5d4]" />
            <span className="text-sm text-[#00f5d4] font-medium">AI Trip Generator</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Tell us your dream trip
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Fill in the details below and Claude AI will craft a complete, beautiful itinerary
            tailored exactly to your vibe.
          </p>
        </div>

        <TripForm />
      </div>
    </main>
  );
}
