import {
  Document, Page, Text, View, StyleSheet, Font, pdf,
} from "@react-pdf/renderer";

// ── colour palette ────────────────────────────────────────────────────────────
const C = {
  navy:      "#0B2F89",
  navyLight: "#1a3fa0",
  gold:      "#FEC329",
  white:     "#FFFFFF",
  offWhite:  "#F8F9FC",
  gray50:    "#F1F5F9",
  gray200:   "#E2E8F0",
  gray400:   "#94A3B8",
  gray600:   "#475569",
  gray800:   "#1E293B",
  blue:      "#2563EB",
  blueLight: "#DBEAFE",
  green:     "#059669",
  greenLight:"#D1FAE5",
  red:       "#DC2626",
  redLight:  "#FEE2E2",
  amber:     "#D97706",
  amberLight:"#FEF3C7",
  purple:    "#7C3AED",
  purpleLight:"#EDE9FE",
};

// ── styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    fontSize: 10,
    color: C.gray800,
  },

  // ── Header band ──────────────────────────────────────────────────────────
  headerBand: {
    backgroundColor: C.navy,
    padding: "28 36 24 36",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  logoBlock: { flexDirection: "column" },
  logoAccess: { fontSize: 26, fontFamily: "Helvetica-Bold", color: C.gold, letterSpacing: 1 },
  logoRide:   { fontSize: 26, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 1 },
  logoTagline:{ fontSize: 8, color: "#8fa8d4", marginTop: 3, letterSpacing: 0.5 },
  reportTitle:{ textAlign: "right" },
  reportTitleText: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 0.5 },
  reportPeriod:    { fontSize: 10, color: C.gold, marginTop: 4, fontFamily: "Helvetica-Bold" },
  generatedDate:   { fontSize: 7, color: "#8fa8d4", marginTop: 3 },

  // ── Gold accent bar ───────────────────────────────────────────────────────
  accentBar: { backgroundColor: C.gold, height: 4 },

  // ── Body ─────────────────────────────────────────────────────────────────
  body: { paddingHorizontal: 36, paddingTop: 24 },

  // ── Section headings ─────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: C.navy,
    paddingBottom: 4,
  },
  spacer: { marginTop: 18 },

  // ── 4-up stat cards ───────────────────────────────────────────────────────
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    borderRadius: 6,
    padding: "12 10",
    alignItems: "center",
  },
  statCardLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  statCardValue: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  statCardSub:   { fontSize: 7, marginTop: 3 },

  // ── Two-column layout ─────────────────────────────────────────────────────
  twoCol: { flexDirection: "row", gap: 14 },
  col: { flex: 1 },

  // ── Key-value table ───────────────────────────────────────────────────────
  kvTable: { borderWidth: 1, borderColor: C.gray200, borderRadius: 5, overflow: "hidden" },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  kvRowAlt: { backgroundColor: C.gray50 },
  kvRowHighlight: { backgroundColor: C.blueLight },
  kvLabel: { fontSize: 9, color: C.gray600 },
  kvValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.gray800 },
  kvValueHighlight: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.blue },

  // ── Alerts grid ───────────────────────────────────────────────────────────
  alertGrid: { flexDirection: "row", gap: 8, marginTop: 4 },
  alertCell: {
    flex: 1, borderRadius: 5, padding: "8 6",
    alignItems: "center", borderWidth: 1,
  },
  alertCellLabel: { fontSize: 7, marginTop: 3, textAlign: "center" },
  alertCellValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },

  // ── Drivers table ─────────────────────────────────────────────────────────
  driverTable: { borderWidth: 1, borderColor: C.gray200, borderRadius: 5, overflow: "hidden" },
  driverHead: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  driverHeadCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  driverRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  driverRowAlt: { backgroundColor: C.gray50 },
  driverCell: { fontSize: 8.5, color: C.gray800 },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.navy,
    paddingVertical: 10,
    paddingHorizontal: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 7, color: "#8fa8d4" },
  footerTextBold: { fontSize: 7, color: C.gold, fontFamily: "Helvetica-Bold" },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: { borderBottomWidth: 1, borderBottomColor: C.gray200, marginVertical: 12 },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const lkr = (v) =>
  `LKR ${Number(v).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const KVTable = ({ rows }) => (
  <View style={s.kvTable}>
    {rows.map(({ label, value, highlight, alt }, i) => (
      <View
        key={i}
        style={[
          s.kvRow,
          alt && s.kvRowAlt,
          highlight && s.kvRowHighlight,
          i === rows.length - 1 && { borderBottomWidth: 0 },
        ]}
      >
        <Text style={s.kvLabel}>{label}</Text>
        <Text style={highlight ? s.kvValueHighlight : s.kvValue}>{value}</Text>
      </View>
    ))}
  </View>
);

// ── The PDF Document ──────────────────────────────────────────────────────────
const ReportPDF = ({ data }) => {
  const { period, users, drivers, rides, revenue, alerts, top_drivers } = data;
  const genDate = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <Document
      title={`AccessRide Monthly Report — ${period.month_name} ${period.year}`}
      author="AccessRide Admin Panel"
      creator="AccessRide"
      subject="Monthly Operational Report"
    >
      <Page size="A4" style={s.page}>

        {/* ── HEADER BAND ── */}
        <View style={s.headerBand}>
          <View style={s.logoBlock}>
            <View style={{ flexDirection: "row" }}>
              <Text style={s.logoAccess}>Access</Text>
              <Text style={s.logoRide}>Ride</Text>
            </View>
            <Text style={s.logoTagline}>BLIND ASSISTANCE RIDE SERVICE</Text>
          </View>
          <View style={s.reportTitle}>
            <Text style={s.reportTitleText}>MONTHLY OPERATIONAL REPORT</Text>
            <Text style={s.reportPeriod}>{period.month_name.toUpperCase()} {period.year}</Text>
            <Text style={s.generatedDate}>Generated: {genDate}</Text>
          </View>
        </View>

        {/* ── GOLD ACCENT BAR ── */}
        <View style={s.accentBar} />

        {/* ── BODY ── */}
        <View style={s.body}>

          {/* ── EXECUTIVE SUMMARY CARDS ── */}
          <View style={[s.statsRow, { marginTop: 16 }]}>
            <View style={[s.statCard, { backgroundColor: C.blueLight }]}>
              <Text style={[s.statCardLabel, { color: C.blue }]}>New Users</Text>
              <Text style={[s.statCardValue, { color: C.blue }]}>{users.new}</Text>
              <Text style={[s.statCardSub, { color: C.blue }]}>{users.total} total</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: C.amberLight }]}>
              <Text style={[s.statCardLabel, { color: C.amber }]}>New Drivers</Text>
              <Text style={[s.statCardValue, { color: C.amber }]}>{drivers.new}</Text>
              <Text style={[s.statCardSub, { color: C.amber }]}>{drivers.total} total</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: C.purpleLight }]}>
              <Text style={[s.statCardLabel, { color: C.purple }]}>Total Rides</Text>
              <Text style={[s.statCardValue, { color: C.purple }]}>{rides.total}</Text>
              <Text style={[s.statCardSub, { color: C.purple }]}>{rides.completion_rate}% completion</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: C.greenLight }]}>
              <Text style={[s.statCardLabel, { color: C.green }]}>Revenue</Text>
              <Text style={[s.statCardValue, { color: C.green, fontSize: 14 }]}>{lkr(revenue.total)}</Text>
              <Text style={[s.statCardSub, { color: C.green }]}>Fares + Subscriptions</Text>
            </View>
          </View>

          {/* ── TWO-COLUMN: Users + Drivers ── */}
          <Text style={s.sectionTitle}>Platform Registrations</Text>
          <View style={s.twoCol}>
            <View style={s.col}>
              <KVTable rows={[
                { label: "New Users Registered",      value: String(users.new),   alt: true },
                { label: "Total Users (Cumulative)",  value: String(users.total), highlight: true },
              ]} />
            </View>
            <View style={s.col}>
              <KVTable rows={[
                { label: "New Drivers Registered",    value: String(drivers.new),     alt: true },
                { label: "Drivers Removed / Inactive",value: String(drivers.removed)             },
                { label: "Total Drivers (Cumulative)",value: String(drivers.total),   highlight: true },
              ]} />
            </View>
          </View>

          {/* ── TWO-COLUMN: Rides + Revenue ── */}
          <View style={s.spacer} />
          <Text style={s.sectionTitle}>Rides & Revenue</Text>
          <View style={s.twoCol}>
            <View style={s.col}>
              <KVTable rows={[
                { label: "Total Rides",             value: String(rides.total)                                   },
                { label: "Completed",               value: `${rides.completed}  (${rides.completion_rate}%)`,  alt: true },
                { label: "Cancelled",               value: `${rides.cancelled}  (${rides.cancellation_rate}%)`          },
                { label: "Pending",                 value: String(rides.pending),                              alt: true },
                { label: "Active",                  value: String(rides.active)                                          },
                { label: "Total Fare Collected",    value: lkr(rides.total_fare),                             highlight: true },
              ]} />
            </View>
            <View style={s.col}>
              <KVTable rows={[
                { label: "Ride Fare Revenue",       value: lkr(revenue.ride_fare),     alt: true },
                { label: "Subscription Revenue",    value: lkr(revenue.subscriptions)            },
                { label: "Total Revenue",           value: lkr(revenue.total),         highlight: true },
              ]} />
            </View>
          </View>

          {/* ── ALERTS ── */}
          <View style={s.spacer} />
          <Text style={s.sectionTitle}>Alerts & Incidents</Text>
          <View style={s.alertGrid}>
            {[
              { label: "Total",            value: alerts.total,            bg: C.gray50,     border: C.gray200, textColor: C.gray800  },
              { label: "SOS",              value: alerts.sos,              bg: C.redLight,   border: "#FCA5A5", textColor: C.red       },
              { label: "Low Battery",      value: alerts.low_battery,      bg: C.amberLight, border: "#FCD34D", textColor: C.amber     },
              { label: "Navigation",       value: alerts.navigation,       bg: C.blueLight,  border: "#93C5FD", textColor: C.blue      },
              { label: "Driver Emergency", value: alerts.driver_emergency, bg: "#FFF7ED",    border: "#FDBA74", textColor: "#EA580C"   },
              { label: "Resolved",         value: alerts.resolved,         bg: C.greenLight, border: "#6EE7B7", textColor: C.green     },
            ].map(({ label, value, bg, border, textColor }) => (
              <View key={label} style={[s.alertCell, { backgroundColor: bg, borderColor: border }]}>
                <Text style={[s.alertCellValue, { color: textColor }]}>{value}</Text>
                <Text style={[s.alertCellLabel, { color: textColor }]}>{label}</Text>
              </View>
            ))}
          </View>

          {/* ── TOP DRIVERS ── */}
          <View style={s.spacer} />
          <Text style={s.sectionTitle}>Top Performing Drivers — {period.month_name} {period.year}</Text>

          {top_drivers.length === 0 ? (
            <Text style={{ fontSize: 9, color: C.gray400, fontStyle: "italic" }}>
              No completed rides recorded for this month.
            </Text>
          ) : (
            <View style={s.driverTable}>
              {/* Head */}
              <View style={s.driverHead}>
                <Text style={[s.driverHeadCell, { width: 24 }]}>#</Text>
                <Text style={[s.driverHeadCell, { flex: 2 }]}>Driver Name</Text>
                <Text style={[s.driverHeadCell, { flex: 1.5 }]}>Phone</Text>
                <Text style={[s.driverHeadCell, { width: 60, textAlign: "right" }]}>Rides</Text>
                <Text style={[s.driverHeadCell, { width: 90, textAlign: "right" }]}>Earnings (LKR)</Text>
              </View>
              {/* Rows */}
              {top_drivers.map((d, i) => (
                <View key={i} style={[s.driverRow, i % 2 === 1 && s.driverRowAlt]}>
                  <Text style={[s.driverCell, { width: 24, color: i < 3 ? C.gold : C.gray400 }]}>
                    {i + 1}
                  </Text>
                  <Text style={[s.driverCell, { flex: 2, fontFamily: i === 0 ? "Helvetica-Bold" : "Helvetica" }]}>
                    {d.name || "—"}
                  </Text>
                  <Text style={[s.driverCell, { flex: 1.5, color: C.gray600 }]}>{d.phone || "—"}</Text>
                  <Text style={[s.driverCell, { width: 60, textAlign: "right", color: C.purple, fontFamily: "Helvetica-Bold" }]}>
                    {d.rides_completed}
                  </Text>
                  <Text style={[s.driverCell, { width: 90, textAlign: "right", color: C.green, fontFamily: "Helvetica-Bold" }]}>
                    {Number(d.earnings).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── DECLARATION ── */}
          <View style={[s.divider, { marginTop: 24 }]} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <View>
              <Text style={{ fontSize: 8, color: C.gray400 }}>This report is auto-generated by the AccessRide Admin Panel.</Text>
              <Text style={{ fontSize: 8, color: C.gray400, marginTop: 2 }}>It contains confidential operational data intended for internal company use only.</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 8, color: C.gray600, fontFamily: "Helvetica-Bold" }}>Authorised by:</Text>
              <Text style={{ fontSize: 8, color: C.gray400, marginTop: 12, borderTopWidth: 0.5, borderTopColor: C.gray400, paddingTop: 2, minWidth: 120, textAlign: "center" }}>Administrator</Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            <Text style={s.footerTextBold}>AccessRide</Text>
            {"  ·  Blind Assistance Ride Service  ·  CONFIDENTIAL"}
          </Text>
          <Text style={s.footerText}>
            {period.month_name} {period.year} Operational Report
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// ── Download helper ───────────────────────────────────────────────────────────
export const downloadReport = async (data) => {
  const blob = await pdf(<ReportPDF data={data} />).toBlob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `AccessRide_Report_${data.period.month_name}_${data.period.year}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

export default ReportPDF;
