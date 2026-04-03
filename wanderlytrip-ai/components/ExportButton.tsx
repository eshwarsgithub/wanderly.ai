"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import type { GeneratedItinerary } from "@/lib/ai-agent";

interface ExportButtonProps {
  itinerary: GeneratedItinerary;
}

export default function ExportButton({ itinerary }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (loading) return;
    setLoading(true);
    try {
      // Lazy-import to avoid SSR issues with @react-pdf/renderer
      const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");

      const styles = StyleSheet.create({
        page: { backgroundColor: "#0a0a0a", color: "#f0fffe", padding: 40, fontFamily: "Helvetica" },
        cover: { marginBottom: 32 },
        title: { fontSize: 28, fontWeight: "bold", color: "#00f5d4", marginBottom: 8 },
        subtitle: { fontSize: 12, color: "#ffffff88", marginBottom: 4 },
        badge: { fontSize: 10, color: "#00f5d4", marginBottom: 16, textTransform: "capitalize" },
        sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#00f5d4", marginBottom: 10, marginTop: 20, borderBottomWidth: 1, borderBottomColor: "#00f5d433", paddingBottom: 4 },
        dayHeader: { fontSize: 12, fontWeight: "bold", color: "#ffffff", marginBottom: 6, marginTop: 14 },
        dayTheme: { fontSize: 10, color: "#00f5d4aa", marginBottom: 8 },
        activityRow: { flexDirection: "row", marginBottom: 8, gap: 8 },
        activityTime: { fontSize: 9, color: "#ffffff55", width: 36, fontFamily: "Helvetica-Oblique" },
        activityName: { fontSize: 10, color: "#ffffffcc", fontWeight: "bold", flex: 1 },
        activityCost: { fontSize: 9, color: "#00f5d4", width: 40, textAlign: "right" },
        activityDesc: { fontSize: 9, color: "#ffffff77", marginLeft: 44, marginBottom: 4, lineHeight: 1.4 },
        tip: { fontSize: 9, color: "#ffffff55", marginTop: 2, marginLeft: 44 },
        listItem: { fontSize: 10, color: "#ffffffcc", marginBottom: 5, flexDirection: "row", gap: 6 },
        bullet: { color: "#00f5d4", fontSize: 10 },
        summary: { fontSize: 11, color: "#ffffffaa", lineHeight: 1.6, marginBottom: 12 },
        statRow: { flexDirection: "row", gap: 20, marginTop: 8, marginBottom: 16 },
        stat: { fontSize: 10, color: "#ffffff88" },
        statValue: { color: "#00f5d4" },
      });

      const ItineraryDocument = () => (
        <Document title={`${itinerary.destination} Itinerary — WanderlyTrip.ai`}>
          <Page size="A4" style={styles.page}>
            {/* Cover */}
            <View style={styles.cover}>
              <Text style={styles.title}>{itinerary.destination}</Text>
              <Text style={styles.badge}>{itinerary.vibe} trip</Text>
              <Text style={styles.summary}>{itinerary.summary}</Text>
              <View style={styles.statRow}>
                <Text style={styles.stat}><Text style={styles.statValue}>{itinerary.totalDays}</Text> days</Text>
                <Text style={styles.stat}>Budget: <Text style={styles.statValue}>${itinerary.totalBudget.toLocaleString()}</Text></Text>
                <Text style={styles.stat}><Text style={styles.statValue}>{itinerary.country}</Text></Text>
              </View>
            </View>

            {/* Days */}
            <Text style={styles.sectionTitle}>Day-by-Day Itinerary</Text>
            {itinerary.days.map((day) => (
              <View key={day.day} wrap={false}>
                <Text style={styles.dayHeader}>Day {day.day} — {day.theme}</Text>
                <Text style={styles.dayTheme}>{day.date} · {day.mood} · Est. ${day.dailyCost}</Text>
                {day.activities.map((act) => (
                  <View key={act.id}>
                    <View style={styles.activityRow}>
                      <Text style={styles.activityTime}>{act.time}</Text>
                      <Text style={styles.activityName}>{act.name}</Text>
                      <Text style={styles.activityCost}>${act.estimatedCost}</Text>
                    </View>
                    <Text style={styles.activityDesc}>{act.description}</Text>
                    {act.tips && <Text style={styles.tip}>💡 {act.tips}</Text>}
                  </View>
                ))}
              </View>
            ))}

            {/* Packing Tips */}
            <Text style={styles.sectionTitle}>Packing Tips</Text>
            {itinerary.packingTips.map((tip, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>·</Text>
                <Text style={{ fontSize: 10, color: "#ffffffcc", flex: 1 }}>{tip}</Text>
              </View>
            ))}

            {/* Local Customs */}
            <Text style={styles.sectionTitle}>Local Customs</Text>
            {itinerary.localCustoms.map((c, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>·</Text>
                <Text style={{ fontSize: 10, color: "#ffffffcc", flex: 1 }}>{c}</Text>
              </View>
            ))}

            {/* Footer */}
            <Text style={{ fontSize: 8, color: "#ffffff33", marginTop: 24 }}>
              Generated by WanderlyTrip.ai — {new Date().toLocaleDateString()}
            </Text>
          </Page>
        </Document>
      );

      const blob = await pdf(<ItineraryDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${itinerary.destination.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-itinerary.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
      style={{
        background: "rgba(0,245,212,0.1)",
        border: "1px solid rgba(0,245,212,0.25)",
        color: "#00f5d4",
      }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? "Exporting..." : "Export PDF"}
    </motion.button>
  );
}
