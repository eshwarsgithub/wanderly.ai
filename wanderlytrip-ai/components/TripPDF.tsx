import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { GeneratedItinerary } from "@/lib/ai-agent";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff", fontWeight: 700 },
  ],
});

const INK = "#0f0f0f";
const SLATE = "#475569";
const MUTED = "#94a3b8";
const RULE = "#e2e8f0";
const SURFACE = "#f8fafc";
const AMBER = "#F59E0B";

const styles = StyleSheet.create({
  page: { fontFamily: "Inter", backgroundColor: "#ffffff", padding: "48 48 60 48", fontSize: 10, color: INK },

  header: { marginBottom: 32, paddingBottom: 20, borderBottom: `1px solid ${RULE}` },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  brand: { fontSize: 11, fontWeight: 700, color: INK, letterSpacing: 1 },
  brandDot: { fontSize: 11, fontWeight: 700, color: AMBER },
  title: { fontSize: 32, fontWeight: 700, color: INK, lineHeight: 1.1, marginBottom: 8 },
  subtitle: { fontSize: 10, color: SLATE, lineHeight: 1.6, maxWidth: 420 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  stat: { backgroundColor: SURFACE, padding: "7 12", borderRadius: 6, borderLeft: `2px solid ${INK}` },
  statLabel: { fontSize: 7, color: MUTED, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.8 },
  statValue: { fontSize: 10, fontWeight: 700, color: INK },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 9, fontWeight: 700, color: INK, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${RULE}`, textTransform: "uppercase", letterSpacing: 1.2 },

  dayBlock: { marginBottom: 12, borderRadius: 8, overflow: "hidden", border: `1px solid ${RULE}` },
  dayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "8 12", backgroundColor: INK },
  dayNumber: { fontSize: 8, fontWeight: 700, color: "#ffffff", opacity: 0.6, marginBottom: 1, textTransform: "uppercase", letterSpacing: 0.8 },
  dayTitle: { fontSize: 10, fontWeight: 700, color: "#ffffff" },
  dayMeta: { fontSize: 8, color: "#ffffff", opacity: 0.6 },
  dayBody: { padding: "10 12" },

  activityRow: { flexDirection: "row", gap: 10, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${RULE}` },
  activityTime: { width: 36, fontSize: 8, color: MUTED, fontWeight: 700, flexShrink: 0, paddingTop: 1 },
  activityContent: { flex: 1 },
  activityName: { fontSize: 10, fontWeight: 700, color: INK, marginBottom: 2 },
  activityDesc: { fontSize: 8, color: SLATE, lineHeight: 1.5 },
  activityMeta: { fontSize: 8, color: MUTED, marginTop: 3 },

  listItem: { flexDirection: "row", gap: 8, marginBottom: 5 },
  bullet: { fontSize: 9, color: MUTED, width: 12, flexShrink: 0, paddingTop: 1 },
  listText: { fontSize: 9, color: SLATE, lineHeight: 1.5, flex: 1 },

  highlightItem: { flexDirection: "row", gap: 8, marginBottom: 5 },
  highlightBullet: { fontSize: 9, color: AMBER, width: 12, flexShrink: 0 },
  highlightText: { fontSize: 9, color: INK, fontWeight: 700, flex: 1, lineHeight: 1.4 },

  footer: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${RULE}`, paddingTop: 8 },
  footerText: { fontSize: 7, color: MUTED },
});

export default function TripPDF({ itinerary }: { itinerary: GeneratedItinerary }) {
  return (
    <Document title={`${itinerary.destination} Itinerary`} author="WanderlyTrip.ai">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>Wanderly</Text>
            <Text style={styles.brandDot}>.</Text>
          </View>
          <Text style={styles.title}>{itinerary.destination}</Text>
          <Text style={styles.subtitle}>{itinerary.summary}</Text>
          <View style={styles.statsRow}>
            {[
              { label: "Duration",  value: `${itinerary.totalDays} days` },
              { label: "Budget",    value: `${itinerary.currency} ${itinerary.totalBudget.toLocaleString()}` },
              { label: "Country",   value: itinerary.country },
              { label: "Vibe",      value: itinerary.vibe },
              { label: "Best time", value: itinerary.bestTimeToVisit },
            ].map(({ label, value }) => (
              <View key={label} style={styles.stat}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {itinerary.highlights.map((h, i) => (
            <View key={i} style={styles.highlightItem}>
              <Text style={styles.highlightBullet}>★</Text>
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Day-by-day */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day-by-Day Itinerary</Text>
          {itinerary.days.map((day) => (
            <View key={day.day} style={styles.dayBlock} wrap={false}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayNumber}>Day {day.day}</Text>
                  <Text style={styles.dayTitle}>{day.theme}</Text>
                </View>
                <Text style={styles.dayMeta}>{day.date} · Est. ${day.dailyCost}</Text>
              </View>
              <View style={styles.dayBody}>
                {day.activities.map((act, i) => (
                  <View key={act.id} style={[styles.activityRow, i === day.activities.length - 1 ? { borderBottom: "none", marginBottom: 0, paddingBottom: 0 } : {}]}>
                    <Text style={styles.activityTime}>{act.time}</Text>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityName}>{act.name}</Text>
                      <Text style={styles.activityDesc}>{act.description}</Text>
                      <Text style={styles.activityMeta}>{act.location} · ${act.estimatedCost} · {act.duration}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Packing Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Packing Tips</Text>
          {itinerary.packingTips.map((tip, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>{i + 1}.</Text>
              <Text style={styles.listText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Local Customs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Customs &amp; Etiquette</Text>
          {itinerary.localCustoms.map((c, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>—</Text>
              <Text style={styles.listText}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>WanderlyTrip.ai · AI-powered travel planning</Text>
          <Text style={styles.footerText}>{itinerary.destination} · {itinerary.totalDays} days · {itinerary.currency} {itinerary.totalBudget.toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
}
