"use client";
import { useState } from "react";
import { FileText, Download, CheckCircle, Loader, BarChart2, Shield, Zap, TrendingUp, MapPin, AlertTriangle } from "lucide-react";

const sections = [
  { id: "executive",    label: "Executive Summary",         icon: FileText,      default: true },
  { id: "forecast",     label: "Demand Forecast Results",   icon: TrendingUp,    default: true },
  { id: "scheduling",   label: "Scheduling Performance",    icon: Zap,           default: true },
  { id: "tariff",       label: "Tariff Impact Analysis",    icon: BarChart2,     default: true },
  { id: "siting",       label: "Siting Recommendations",    icon: MapPin,        default: true },
  { id: "anomaly",      label: "Anomaly & Fraud Report",    icon: AlertTriangle, default: false },
  { id: "federation",   label: "Federated Model Status",    icon: Shield,        default: false },
  { id: "capex",        label: "CAPEX Planning",            icon: BarChart2,     default: true },
];

const reportData = {
  period: "November 2024",
  subDivisions: 3,
  dtrs: 1247,
  evRegistrations: 84312,
  forecastMape: 8.2,
  peakReduction: 21.4,
  usersNudged: 1247,
  acceptanceRate: 64,
  avgDelay: 28,
  capexSaved: 22,
  transformersSaved: 3,
  sitingRecommendations: 247,
  anomaliesDetected: 6,
  co2Avoided: 4.8,
};

export default function ReportPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set(sections.filter(s => s.default).map(s => s.id)));
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reportType, setReportType] = useState<"pdf" | "html">("pdf");

  function toggle(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setGenerated(false);
  }

  function generate() {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2200);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Auto Report Generator</h1>
        <p className="text-[#64748b] text-sm mt-1">BESCOM-ready reports · Government meetings · Funding approvals · Council presentations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config */}
        <div className="space-y-4">
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="text-sm font-semibold text-white mb-3">Report Configuration</div>

            <div className="space-y-1 mb-4">
              <div className="text-xs text-[#64748b] mb-2">Report Period</div>
              <div className="bg-[#0f1117] border border-[#2d3748] rounded-lg px-3 py-2 text-sm text-white">{reportData.period}</div>
            </div>

            <div className="space-y-1 mb-4">
              <div className="text-xs text-[#64748b] mb-2">Format</div>
              <div className="flex gap-2">
                {(["pdf", "html"] as const).map(t => (
                  <button key={t} onClick={() => setReportType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase border transition-all ${reportType === t ? "bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/40" : "text-[#64748b] border-[#2d3748]"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#64748b] mb-2">Sections to include</div>
            <div className="space-y-1.5">
              {sections.map(s => {
                const Icon = s.icon;
                const on = selected.has(s.id);
                return (
                  <button key={s.id} onClick={() => toggle(s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs transition-all ${on ? "border-[#6366f1]/40 bg-[#6366f1]/10 text-white" : "border-[#2d3748] text-[#64748b] hover:border-[#64748b]"}`}>
                    <Icon size={11} style={{ color: on ? "#6366f1" : "#64748b" }} />
                    <span className="flex-1 text-left">{s.label}</span>
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${on ? "bg-[#6366f1] border-[#6366f1]" : "border-[#2d3748]"}`}>
                      {on && <CheckCircle size={9} className="text-white" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <button onClick={generate} disabled={generating || selected.size === 0}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] transition-colors disabled:opacity-50">
              {generating ? <Loader size={14} className="animate-spin" /> : <FileText size={14} />}
              {generating ? "Generating…" : `Generate ${reportType.toUpperCase()}`}
            </button>

            {generated && (
              <button className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 text-sm font-semibold hover:bg-[#10b981]/30 transition-colors">
                <Download size={14} />
                Download Report
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="col-span-2">
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3748]">
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-[#6366f1]" />
                <span className="text-sm font-semibold text-white">Report Preview</span>
              </div>
              {generated && (
                <span className="flex items-center gap-1.5 text-xs text-[#10b981]">
                  <CheckCircle size={11} /> Ready to download
                </span>
              )}
            </div>

            <div className="p-6 space-y-6 font-mono text-xs max-h-[600px] overflow-y-auto">
              {/* Header */}
              <div className="border-b border-[#2d3748] pb-4">
                <div className="text-lg font-bold text-white mb-1">BESCOM GridPulse BLR</div>
                <div className="text-[#6366f1]">EV Demand Management & Infrastructure Planning Report</div>
                <div className="text-[#64748b] mt-1">Period: {reportData.period} · Generated: {new Date().toLocaleDateString("en-IN")}</div>
                <div className="text-[#64748b]">Sub-Divisions: {reportData.subDivisions} · DTRs Monitored: {reportData.dtrs.toLocaleString()}</div>
              </div>

              {/* Executive Summary */}
              {selected.has("executive") && (
                <div>
                  <div className="text-[#00d4aa] font-bold mb-2">1. EXECUTIVE SUMMARY</div>
                  <div className="text-[#94a3b8] leading-relaxed space-y-1">
                    <div>GridPulse BLR successfully managed EV charging demand across {reportData.subDivisions} BESCOM sub-divisions during {reportData.period}.</div>
                    <div>Key outcomes: {reportData.peakReduction}% evening peak reduction, ₹{reportData.capexSaved}L CAPEX deferred, {reportData.transformersSaved} transformer upgrades avoided.</div>
                    <div>System operated with {reportData.forecastMape}% forecast MAPE — significantly better than 23% persistence baseline.</div>
                  </div>
                </div>
              )}

              {/* KPI table */}
              {selected.has("executive") && (
                <div className="border border-[#2d3748] rounded-lg overflow-hidden">
                  <div className="bg-[#0f1117] px-3 py-2 text-[#64748b] font-bold border-b border-[#2d3748]">KEY PERFORMANCE INDICATORS</div>
                  {[
                    ["EV Registrations (Vahan)", reportData.evRegistrations.toLocaleString()],
                    ["Forecast MAPE (24h horizon)", `${reportData.forecastMape}%`],
                    ["Evening Peak Reduction", `${reportData.peakReduction}%`],
                    ["Users Nudged", reportData.usersNudged.toLocaleString()],
                    ["Nudge Acceptance Rate", `${reportData.acceptanceRate}%`],
                    ["Average User Delay", `${reportData.avgDelay} minutes`],
                    ["CAPEX Deferred", `₹${reportData.capexSaved} Lakhs`],
                    ["CO₂ Avoided", `${reportData.co2Avoided} tonnes`],
                    ["Anomalies Detected", String(reportData.anomaliesDetected)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between px-3 py-1.5 border-b border-[#2d3748] last:border-0">
                      <span className="text-[#64748b]">{k}</span>
                      <span className="text-[#00d4aa] font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {selected.has("forecast") && (
                <div>
                  <div className="text-[#6366f1] font-bold mb-2">2. DEMAND FORECAST RESULTS</div>
                  <div className="text-[#94a3b8] leading-relaxed space-y-1">
                    <div>Model: Graph WaveNet (spatio-temporal GNN) · Nodes: DTRs · Edges: 11kV feeder topology</div>
                    <div>MAPE at 24h horizon: {reportData.forecastMape}% (vs 23% persistence, 14% vanilla LSTM)</div>
                    <div>Uncertainty quantification via Monte Carlo Dropout — confidence bands on all predictions.</div>
                    <div>Critical DTRs flagged: DTR-114 (Koramangala), DTR-089 (Sarjapur) — both correctly predicted 2h ahead.</div>
                  </div>
                </div>
              )}

              {selected.has("scheduling") && (
                <div>
                  <div className="text-[#f59e0b] font-bold mb-2">3. SCHEDULING PERFORMANCE</div>
                  <div className="text-[#94a3b8] leading-relaxed space-y-1">
                    <div>Algorithm: Contextual Bandit with constraint satisfaction · Fairness-weighted objective</div>
                    <div>Users nudged: {reportData.usersNudged.toLocaleString()} · Acceptance: {reportData.acceptanceRate}% · Modified: 18% · Ignored: 18%</div>
                    <div>Average delay imposed: {reportData.avgDelay} minutes (within 40-minute policy limit)</div>
                    <div>Peak reduction achieved: {reportData.peakReduction}% in 7–10 PM window</div>
                  </div>
                </div>
              )}

              {selected.has("siting") && (
                <div>
                  <div className="text-[#10b981] font-bold mb-2">4. SITING RECOMMENDATIONS</div>
                  <div className="text-[#94a3b8] leading-relaxed space-y-1">
                    <div>Algorithm: NSGA-II multi-objective optimization · 500m hexagonal grid · BBMP coverage</div>
                    <div>Top recommendations: {reportData.sitingRecommendations} locations · 90% of 2027 demand covered</div>
                    <div>30% fewer stations than uniform placement · All sites have &gt;25% feeder headroom</div>
                    <div>68% of recommended sites V2G-ready for 2028 deployment</div>
                  </div>
                </div>
              )}

              {selected.has("capex") && (
                <div>
                  <div className="text-[#ec4899] font-bold mb-2">5. CAPEX PLANNING</div>
                  <div className="text-[#94a3b8] leading-relaxed space-y-1">
                    <div>Transformers requiring upgrade: 6 identified · 2 critical (DTR-114, DTR-089)</div>
                    <div>CAPEX deferred via demand shifting: ₹{reportData.capexSaved} Lakhs this cycle</div>
                    <div>DTR-412 and DTR-731 upgrades deferred 2–3 years via scheduling nudges</div>
                    <div>Recommended upgrade timeline: DTR-114 and DTR-089 by Q3 2026</div>
                  </div>
                </div>
              )}

              {selected.has("anomaly") && (
                <div>
                  <div className="text-[#ef4444] font-bold mb-2">6. ANOMALY & FRAUD REPORT</div>
                  <div className="text-[#94a3b8] leading-relaxed space-y-1">
                    <div>Total anomalies detected: {reportData.anomaliesDetected} · Open: 2 · Investigating: 2 · Resolved: 2</div>
                    <div>Tariff gaming cases: 2 (U-4821, U-2234) — referred to billing audit</div>
                    <div>Unauthorized chargers: 2 (DTR-089, DTR-156) — field inspection scheduled</div>
                    <div>Abnormal load spikes: 2 (DTR-278, DTR-412) — root cause identified</div>
                  </div>
                </div>
              )}

              {selected.has("federation") && (
                <div>
                  <div className="text-[#00d4aa] font-bold mb-2">7. FEDERATED MODEL STATUS</div>
                  <div className="text-[#94a3b8] leading-relaxed space-y-1">
                    <div>Architecture: Federated Learning · 3 sub-divisions · Gradient-only exchange</div>
                    <div>Privacy: No raw consumer data shared · Differential privacy noise applied</div>
                    <div>SD-01 accuracy: 91.2% · SD-02: 88.7% · SD-03: 89.4%</div>
                    <div>Total gradient exchanges this period: 5,361 · All encrypted TLS 1.3</div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-[#2d3748] pt-4 text-[#64748b]">
                <div>Generated by GridPulse BLR v1.0 · BESCOM Theme 9: AI for EV Charging Optimization</div>
                <div>This report is auto-generated. All recommendations are SHAP-verified and audit-ready.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
