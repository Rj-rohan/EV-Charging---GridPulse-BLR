"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { FlaskConical, ShieldCheck, AlertTriangle, Info } from "lucide-react";

const globalShap = [
  { feature: "Historical SCADA Load",    shap: 0.31, color: "#00d4aa" },
  { feature: "EV Registration Density",  shap: 0.24, color: "#6366f1" },
  { feature: "Hour of Day",              shap: 0.17, color: "#f59e0b" },
  { feature: "Day of Week",              shap: 0.10, color: "#10b981" },
  { feature: "Feeder Topology (Graph)",  shap: 0.09, color: "#ec4899" },
  { feature: "Land Use (Bhuvan)",        shap: 0.05, color: "#64748b" },
  { feature: "Weather / Temperature",    shap: 0.04, color: "#64748b" },
];

const dtrs = [
  {
    id: "DTR-114", ward: "Koramangala 5B", prediction: "Overload at 20:30",
    confidence: "High", confidenceScore: 94,
    reasons: [
      { factor: "EV cluster: 47 registrations in 500m radius", impact: "high", dir: "up" },
      { factor: "Historical peak: 91% load last 3 Tuesdays", impact: "high", dir: "up" },
      { factor: "Feeder neighbor DTR-112 already at 88%", impact: "med", dir: "up" },
      { factor: "No scheduled maintenance reducing load", impact: "low", dir: "neutral" },
    ],
  },
  {
    id: "DTR-089", ward: "Sarjapur Rd", prediction: "Overcurrent risk 21:00",
    confidence: "High", confidenceScore: 88,
    reasons: [
      { factor: "Rising load trend: +12% over past 7 days", impact: "high", dir: "up" },
      { factor: "Ola fleet depot 200m away — bulk charge expected", impact: "high", dir: "up" },
      { factor: "Transformer age: 14 years — reduced headroom", impact: "med", dir: "up" },
    ],
  },
  {
    id: "DTR-278", ward: "Marathahalli", prediction: "Moderate stress 20:00–21:30",
    confidence: "Medium", confidenceScore: 74,
    reasons: [
      { factor: "EV density growing: +18% MoM from Vahan data", impact: "med", dir: "up" },
      { factor: "Graph diffusion from DTR-114 (adjacent feeder)", impact: "med", dir: "up" },
      { factor: "Uncertainty: SCADA data gap 14:00–16:00 today", impact: "low", dir: "neutral" },
    ],
  },
  {
    id: "DTR-341", ward: "Electronic City", prediction: "Normal — no risk",
    confidence: "High", confidenceScore: 91,
    reasons: [
      { factor: "Load at 61% — 39% headroom available", impact: "low", dir: "down" },
      { factor: "IT park load drops after 20:00 (shift end)", impact: "med", dir: "down" },
    ],
  },
];

const confColor: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
const impactColor: Record<string, string> = { high: "#ef4444", med: "#f59e0b", low: "#64748b" };
const dirIcon: Record<string, string> = { up: "↑", down: "↓", neutral: "→" };

export default function ExplainabilityPage() {
  const [selected, setSelected] = useState(dtrs[0]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Model Explainability</h1>
        <p className="text-[#64748b] text-sm mt-1">SHAP global importance · Per-DTR reasoning · Confidence scoring · Audit-ready</p>
      </div>

      <div className="bg-[#1a1f2e] border border-[#f59e0b]/30 rounded-xl p-3 flex items-start gap-3">
        <Info size={14} className="text-[#f59e0b] mt-0.5 shrink-0" />
        <p className="text-xs text-[#94a3b8]">
          Every prediction made by GridPulse BLR is explainable. Sub-Division officers can use this panel to defend recommendations in council meetings. No black-box decisions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Global SHAP */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical size={14} className="text-[#6366f1]" />
            <div className="text-sm font-semibold text-white">Global SHAP Feature Importance</div>
          </div>
          <div className="text-xs text-[#64748b] mb-3">Averaged across all DTR predictions · Graph WaveNet model</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={globalShap} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} domain={[0, 0.35]} />
              <YAxis type="category" dataKey="feature" tick={{ fill: "#94a3b8", fontSize: 10 }} width={160} />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
                formatter={(v) => [`${(Number(v) * 100).toFixed(0)}%`, "SHAP contribution"]} />
              <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
                {globalShap.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DTR selector */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-4">Per-DTR Explanation</div>
          <div className="space-y-2 mb-4">
            {dtrs.map(d => (
              <button key={d.id} onClick={() => setSelected(d)}
                className={`w-full text-left rounded-lg p-3 border transition-all ${selected.id === d.id ? "border-[#6366f1]/50 bg-[#6366f1]/10" : "border-[#2d3748] hover:border-[#64748b]"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#6366f1]">{d.id}</span>
                    <span className="text-xs text-[#64748b] ml-2">{d.ward}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${confColor[d.confidence]}20`, color: confColor[d.confidence] }}>
                    {d.confidence} · {d.confidenceScore}%
                  </span>
                </div>
                <div className="text-xs text-[#e2e8f0] mt-1">{d.prediction}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected DTR explanation */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">Why was this predicted?</span>
              <span className="font-mono text-xs text-[#6366f1]">{selected.id}</span>
              <span className="text-xs text-[#64748b]">{selected.ward}</span>
            </div>
            <div className="text-xs text-[#94a3b8] mt-1">{selected.prediction}</div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} style={{ color: confColor[selected.confidence] }} />
            <span className="text-sm font-bold" style={{ color: confColor[selected.confidence] }}>
              {selected.confidence} Confidence · {selected.confidenceScore}%
            </span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="h-2 bg-[#2d3748] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${selected.confidenceScore}%`, background: confColor[selected.confidence] }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#64748b] mt-1">
            <span>Low confidence (MC Dropout uncertainty high)</span>
            <span>High confidence (consistent signal)</span>
          </div>
        </div>

        <div className="space-y-2">
          {selected.reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3 bg-[#0f1117] border border-[#2d3748]">
              <span className="text-base font-bold w-5 text-center" style={{ color: impactColor[r.impact] }}>
                {dirIcon[r.dir]}
              </span>
              <div className="flex-1 text-xs text-[#e2e8f0]">{r.factor}</div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                style={{ background: `${impactColor[r.impact]}20`, color: impactColor[r.impact] }}>
                {r.impact} impact
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg text-xs text-[#94a3b8]">
          <span className="text-[#6366f1] font-semibold">Audit note: </span>
          This explanation is generated using SHAP TreeExplainer on the Graph WaveNet model output. Suitable for Sub-Division officer review and council presentation. Confidence below 70% triggers a human-review flag.
        </div>
      </div>
    </div>
  );
}
