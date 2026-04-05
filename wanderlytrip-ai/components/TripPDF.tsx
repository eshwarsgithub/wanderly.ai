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

const TEAL = "#00c4aa";
const DARK = "#0a0a0a";
const GRAY = "#666666";
const LIGHT_GRAY = "#f0f0f0";

const styles = StyleSheet.create({
  page: { fontFamily: "Inter", backgroundColor: "#ffffff", padding: 40, fontSize: 10, color: DARK },
  header: { marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${TEAL}` },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  brand: { fontSize: 14, fontWeight: 700, color: TEAL },
  title: { fontSize: 28, fontWeight: 700, color: DARK, marginBottom: 6 },
  subtitle: { fontSize: 11, color: GRAY, lineHeight: 1.5 },
  statsRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  stat: { backgroundColor: LIGHT_GRAY, padding: "6 10", borderRadius: 6 },
  statLabel: { fontSize: 8, color: GRAY, marginBottom: 2 },
  statValue: { fontSize: 11, fontWeight: 700, color: DARK },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 10, paddingBottom: 4, borderBottom: `1px solid ${LIGHT_GRAY}` },
  dayBlock: { marginBottom: 14, padding: 10, backgroundColor: LIGHT_GRAY, borderRadius: 6 },
  dayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  dayTitle: { fontSize: 11, fontWeight: 700, color: DARK },
  dayMeta: { fontSize: 9, color: GRAY },
  activityRow: { flexDirection: "row", gap: 8, marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid #e0e0e0` },
  activityTime: { width: 40, fontSize: 9, color: TEAL, fontWeight: 700, flexShrink: 0 },
  activityContent: { flex: 1 },
  activityName: { fontSize: 10, fontWeight: 700, color: DARK },
  activityDesc: { fontSize: 9, color: GRAY, lineHeight: 1.4, marginTop: 2 },
  activityCost: { fontSize: 9, color: TEAL, marginTop: 2 },
  listItem: { flexDirection: "row", gap: 6, marginBottom: 4 },
  bullet: { fontSize: 10, color: TEAL },
  listText: { fontSize: 10, color: DARK, lineHeight: 1.4, flex: 1 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${LIGHT_GRAY}`, paddingTop: 8 },
  footerText: { fontSize: 8, color: GRAY },
});

export default function TripPDF({ itinerary }: { itinerary: GeneratedItinerary }) {
  return (
    <Document title={`${itinerary.destination} Itinerary`} author="WanderlyTrip.ai">
      {/* Page 1: Overview + Day-by-day */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>WanderlyTrip.ai</Text>
          </View>
          <Text style={styles.title}>{itinerary.destination}</Text>
          <Text style={styles.subtitle}>{itinerary.summary}</Text>
          <View style={styles.statsRow}>
            {[
              { label: "Duration", value: `${itinerary.totalDays} days` },
              { label: "Budget", value: `${itinerary.currency} ${itinerary.totalBudget.toLocaleString()}` },
              { label: "Country", value: itinerary.country },
              { label: "Vibe", value: itinerary.vibe },
            ].map(({ label, value }) => (
              <View key={label} style={styles.stat}>
                <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
                <Text style={styles.statValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {itinerary.highlights.map((h, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>★</Text>
              <Text style={styles.listText}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Day-by-day */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day-by-Day Itinerary</Text>
          {itinerary.days.map((day) => (
            <View key={day.day} style={styles.dayBlock} wrap={false}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>Day {day.day} — {day.theme}</Text>
                <Text style={styles.dayMeta}>{day.date} · {day.mood} · Est. ${day.dailyCost}</Text>
              </View>
              {day.activities.map((act) => (
                <View key={act.id} style={styles.activityRow}>
                  <Text style={styles.activityTime}>{act.time}</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityName}>{act.name}</Text>
                    <Text style={styles.activityDesc}>{act.description}</Text>
                    <Text style={styles.activityCost}>{act.location} · ${act.estimatedCost} · {act.duration}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Packing Tips + Local Customs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Packing Tips</Text>
          {itinerary.packingTips.map((tip, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>{i + 1}.</Text>
              <Text style={styles.listText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Customs</Text>
          {itinerary.localCustoms.map((c, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by WanderlyTrip.ai</Text>
          <Text style={styles.footerText}>{itinerary.destination} · {itinerary.totalDays} days · ${itinerary.totalBudget.toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
}
