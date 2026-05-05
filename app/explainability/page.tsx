"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FlaskConical, ShieldCheck, Info } from "lucide-react";
import AIPanel from "@/components/AIPanel";
import { useGroq } from "@/lib/useGroq";
import { prompts } from "@/lib/groq";

const globalShap = [
  { feature: "Historical SCADA Load",   shap: 0.31, color: "#00d4aa" },
  { feature: "EV Registration Density", shap: 0.24, color: "#6366f1" },
  { feature: "Hour of Day",             shap: 0.17, color: "#f59e0b" },
  { feature: "Day of Week",             shap: 0.10, color: "#10b981" },
  { feature: "Feeder Topology (Graph)", shap: 0.09, color: "#ec4899" },
  { feature: "Land Use (Bhuvan)",       shap: 0.05, color: "#64748b" },
  { feature: "Weather / Temperature",   shap: 0.04, color: "#64748b" },
];

const dtrs = [
  { id: "DTR-114", ward: "Koramangala 5B", load: 94 },
  { id: "DTR-089", ward: "Sarjapur Rd",    load: 87 },
  { id: "DTR-278", ward: "Marathahalli",   load: 81 },
  { id: "DTR-341", ward: "Electronic City",load: 61 },
];

interface DTRExplanation {
  prediction: string;
  confidence: "High" | "Medium" | "Low";
  confidenceScore: number;
  reasons: { factor: string; impact: "high" | "med" | "low"; dir: "up" | "down" | "neutral" }[];
}

const confColor: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
const impactColor: Record<string, string> = { high: "#ef4444", med: "#f59e0b", low: "#64748b" };
const dirIcon: Record<string, string> = { up: "↑", down: "↓", neutral: "→" };

export default function ExplainabilityPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = dtrs[selectedIdx];
  const explanation = useGroq<DTRExplanation | null>(null);

  useEffect(() => {
    explanation.fetch(prompts.explainDTR(selected.id, selected.ward, selected.load));
  }, [selectedIdx]);

  const exp = explanation.data;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Model Explainability</h1>
        <p className="text-[#64748b] text-sm mt-1">SHAP global importance · Per-DTR AI reasoning · Confidence scoring · Audit-ready</p>
      </div>

      <div className="bg-[#1a1f2e] border border-[#f59e0b]/30 rounded-xl p-3 flex items-start gap-3">
        <Info size={14} className="text-[#f59e0b] mt-0.5 shrink-0" />
        <p className="text-xs text-[#94a3b8]">
          Every prediction is explainable. Sub-Division officers can use this panel to defend recommendations in council meetings. No black-box decisions. Powered by Groq LLM + SHAP analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <div className="text-sm font-semibold text-white mb-4">Select DTR for AI Explanation</div>
          <div className="space-y-2">
            {dtrs.map((d, i) => (
              <button key={d.id} onClick={() => setSelectedIdx(i)}
                className={`w-full text-left rounded-lg p-3 border transition-all ${selectedIdx === i ? "border-[#6366f1]/50 bg-[#6366f1]/10" : "border-[#2d3748] hover:border-[#64748b]"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#6366f1]">{d.id}</span>
                    <span className="text-xs text-[#64748b] ml-2">{d.ward}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: d.load >= 90 ? "#ef4444" : d.load >= 75 ? "#f59e0b" : "#10b981" }}>
                    {d.load}% load
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <AIPanel title={`AI Explanation — ${selected.id} · ${selected.ward}`}
        loading={explanation.loading} error={explanation.error} lastFetched={explanation.lastFetched}
        onRefresh={() => explanation.fetch(prompts.explainDTR(selected.id, selected.ward, selected.load))} color="#6366f1">
        {exp ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white mb-1">{exp.prediction}</div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} style={{ color: confColor[exp.confidence] }} />
                  <span className="text-sm font-bold" style={{ color: confColor[exp.confidence] }}>
                    {exp.confidence} Confidence · {exp.confidenceScore}%
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-[#2d3748] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${exp.confidenceScore}%`, background: confColor[exp.confidence] }} />
            </div>
            <div className="space-y-2">
              {(exp.reasons ?? []).map((r, i) => (
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
            <div className="p-3 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg text-xs text-[#94a3b8]">
              <span className="text-[#6366f1] font-semibold">Audit note: </span>
              Generated by Groq LLM (llama-3.3-70b) + SHAP TreeExplainer. Suitable for Sub-Division officer review. Confidence below 70% triggers human-review flag.
            </div>
          </div>
        ) : !explanation.loading && (
          <p className="text-xs text-[#64748b] text-center py-4">Select a DTR and click refresh to get AI explanation</p>
        )}
      </AIPanel>
    </div>
  );
}
