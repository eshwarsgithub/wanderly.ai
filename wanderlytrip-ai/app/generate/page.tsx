import Navbar from "@/components/Navbar";
import TripForm from "@/components/TripForm";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const { destination = "" } = await searchParams;

  return (
    <main className="aurora-page min-h-screen">
      <Navbar />
      <div className="v-shell" style={{ paddingTop: 120, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="v-chip v-chip-live" style={{ marginBottom: 18 }}>
            AI Trip Generator
          </div>
          <h1 style={{
            fontFamily: "var(--v-font-display)",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 400,
            letterSpacing: "-0.03em",
            color: "var(--v-ink)",
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Compose your{" "}
            <em style={{ color: "var(--v-violet-2)", fontStyle: "italic" }}>journey</em>
          </h1>
          <p style={{
            fontFamily: "var(--v-font-ui)",
            fontSize: 16,
            color: "var(--v-slate-2)",
            maxWidth: 460,
            margin: "0 auto",
            lineHeight: 1.65,
            opacity: 0.8,
          }}>
            Claude AI crafts a complete, personalised itinerary — flights, stays, dining — tailored to your vibe.
          </p>
        </div>

        <TripForm defaultDestination={destination} />
      </div>
    </main>
  );
}
