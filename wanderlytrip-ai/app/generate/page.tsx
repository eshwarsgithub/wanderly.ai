import Navbar from "@/components/Navbar";
import TripForm from "@/components/TripForm";

export default function GeneratePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
            AI Trip Generator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0f172a] tracking-tight mb-4">
            Tell us your dream trip
          </h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
            Claude AI will craft a complete, personalised itinerary tailored exactly to your vibe.
          </p>
        </div>
        <TripForm />
      </div>
    </main>
  );
}
