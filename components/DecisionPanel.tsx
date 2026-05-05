"use client";
import { useState } from "react";
import { Scale, ChevronRight, Info } from "lucide-react";

type Justification = {
  action: string;
  question: string;
  risks: { label: string; value: string; color: string }[];
  alternatives: { label: string; cost: string; feasible: boolean }[];
  recommendation: string;
  confidence: number;
};

const justifications: Justification[] = [
  {
    action: "Increase peak tariff",
    question: "Why increase tariff tonight?",
    risks: [
      { label: "Peak overload risk",    value: "+32% above safe limit", color: "#ef4444" },
      { label: "DTR-114 oil temp risk", value: "High — 88°C / 85°C limit", color: "#ef4444" },
      { label: "Overcurrent probability", value: "87% confidence (GNN)", color: "#f59e0b" },
      { label: "User impact (delay)",   value: "Avg 28 min — within 40 min limit", color: "#10b981" },
    ],
    alternatives: [
      { label: "Upgrade DTR-114 now",         cost: "₹28L — 6 month lead time", feasible: false },
      { label: "Hard load curtailment",        cost: "Service disruption — not acceptable", feasible: false },
      { label: "Demand shift via tariff (this)", cost: "₹360 incentive — immediate", feasible: true },
    ],
    recommendation: "Tariff-based demand shift is the only immediately feasible option. Upgrade deferred to Q3 2026 after demand-shift validation.",
    confidence: 91,
  },
  {
    action: "Deploy 247 charging stations",
    question: "Why these 247 locations?",
    risks: [
      { label: "2027 EV demand coverage",  value: "90% with 247 vs 30% fewer than uniform", color: "#10b981" },
      { label: "Feeder headroom alignment", value: "All sites have >25% spare capacity", color: "#10b981" },
      { label: "Equity coverage",          value: "All 198 BBMP wards covered", color: "#6366f1" },
      { label: "V2G readiness",            value: "68% of sites V2G-ready for 2028", color: "#f59e0b" },
    ],
    alternatives: [
      { label: "Uniform grid placement",   cost: "357 stations — 30% more CAPEX", feasible: false },
      { label: "Demand-only placement",    cost: "Misses 40% of equity wards", feasible: false },
      { label: "NSGA-II optimized (this)", cost: "247 stations — Pareto optimal", feasible: true },
    ],
    recommendation: "NSGA-II siting balances utilization and equity. SHAP confirms feeder headroom and EV density as primary drivers — defensible in council.",
    confidence: 88,
  },
  {
    action: "Retrain forecasting model",
    question: "Why retrain the model now?",
    risks: [
      { label: "Forecast error on DTR-203", value: "MAPE jumped to 18% (threshold: 12%)", color: "#ef4444" },
      { label: "SCADA data gap",            value: "14:00–16:00 gap filled — retrain needed", color: "#f59e0b" },
      { label: "EV registration surge",     value: "+340 new EVs in Whitefield this month", color: "#f59e0b" },
      { label: "Model drift detected",      value: "KL divergence > 0.15 on SD-02", color: "#ef4444" },
    ],
    alternatives: [
      { label: "Keep current model",        cost: "MAPE stays at 18% — unreliable nudges", feasible: false },
      { label: "Rule-based fallback",       cost: "No personalization — 40% lower acceptance", feasible: false },
      { label: "Federated retrain (this)",  cost: "2h compute — no data leaves sub-division", feasible: true },
    ],
    recommendation: "Federated retrain on SD-02 with new SCADA data. Expected MAPE return to <10% within 48h. No raw data shared.",
    confidence: 94,
  },
];

export default function DecisionPanel() {
  const [selected, setSelected] = useState(0);
  const j = justifications[selected];

  return (
    <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Scale size={14} className="text-[#f59e0b]" />
        <span className="text-sm font-semibold text-white">Decision Justification Panel</span>
        <span className="text-xs text-[#64748b] ml-auto">For officer meetings</span>
      </div>

      {/* Action selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {justifications.map((jj, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${selected === i ? "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40" : "text-[#64748b] border-[#2d3748] hover:border-[#64748b]"}`}>
            {jj.action}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Question + risks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Info size={13} className="text-[#f59e0b]" />
            <span className="text-sm font-semibold text-white">{j.question}</span>
          </div>

          <div className="space-y-2">
            {j.risks.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg p-2.5 bg-[#0f1117] border border-[#2d3748]">
                <span className="text-xs text-[#94a3b8]">{r.label}</span>
                <span className="text-xs font-semibold" style={{ color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[#64748b] font-medium">Alternatives considered:</div>
            {j.alternatives.map((a, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-lg p-2.5 border ${a.feasible ? "border-[#10b981]/30 bg-[#10b981]/5" : "border-[#2d3748] bg-[#0f1117] opacity-60"}`}>
                <span className="text-sm mt-0.5">{a.feasible ? "✓" : "✗"}</span>
                <div>
                  <div className="text-xs font-medium" style={{ color: a.feasible ? "#10b981" : "#64748b" }}>{a.label}</div>
                  <div className="text-[10px] text-[#64748b]">{a.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="space-y-3">
          <div className="bg-[#0f1117] border border-[#f59e0b]/20 rounded-xl p-3">
            <div className="text-[10px] text-[#f59e0b] font-semibold mb-2">AI Recommendation</div>
            <div className="text-xs text-[#94a3b8] leading-relaxed">{j.recommendation}</div>
          </div>
          <div className="bg-[#0f1117] border border-[#2d3748] rounded-xl p-3">
            <div className="text-[10px] text-[#64748b] mb-2">Decision Confidence</div>
            <div className="text-2xl font-bold text-[#10b981]">{j.confidence}%</div>
            <div className="mt-2 h-1.5 bg-[#2d3748] rounded-full overflow-hidden">
              <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${j.confidence}%` }} />
            </div>
            <div className="text-[9px] text-[#64748b] mt-1.5">SHAP-verified · Audit-ready</div>
          </div>
          <div className="bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-xl p-3 text-[10px] text-[#94a3b8]">
            <span className="text-[#6366f1] font-semibold">Audit trail: </span>
            All inputs, model version, and decision timestamp logged. Exportable for council review.
          </div>
        </div>
      </div>
    </div>
  );
}
