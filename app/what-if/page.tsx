"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SlidersHorizontal, TrendingUp, Zap, Wrench, IndianRupee, Play } from "lucide-react";
import AIPanel from "@/components/AIPanel";
import { useGroq } from "@/lib/useGroq";
import { prompts, AIScenarioResult } from "@/lib/groq";

const scenarios = [
  { id: "ev-double",   label: "EV adoption doubles in 2 years",       icon: "🚗" },
  { id: "fast-charge", label: "500 fast chargers added in Whitefield", icon: "⚡" },
  { id: "fleet",       label: "Ola deploys 200 fast chargers (ORR)",   icon: "🛵" },
  { id: "solar",       label: "Rooftop solar 30% penetration",         icon: "☀️" },
];

const baseChartData = [
  { year: "2024", baseline: 380 },
  { year: "2025", baseline: 400 },
  { year: "2026", baseline: 420 },
];

export default function WhatIfPage() {
  const [selected, setSelected] = useState(scenarios[0].id);
  const result = useGroq<AIScenarioResult | null>(null);

  function run() {
    const scenario = scenarios.find(s => s.id === selected)!;
    result.fetch(prompts.scenarioAnalysis(scenario.label));
  }

  const chartData = result.data
    ? baseChartData.map((d, i) => ({
        ...d,
        scenario: Math.round(d.baseline * (1 + (result.data!.peakIncrease / 100) * (i / 2))),
      }))
    : baseChartData;

  const resColor = result.data
    ? result.data.peakIncrease > 20 ? "#ef4444" : result.data.peakIncrease > 0 ? "#f59e0b" : "#10b981"
    : "#6366f1";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Scenario Planner</h1>
        <p className="text-[#64748b] text-sm mt-1">AI-powered what-if analysis · SUMO digital twin · Decision-maker ready outputs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scenario picker */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 space-y-3">
          <div className="text-sm font-semibold text-white">Choose Scenario</div>
          {scenarios.map(s => (
            <button key={s.id} onClick={() => { setSelected(s.id); }}
              className={`w-full text-left rounded-xl p-3 border transition-all ${selected === s.id ? "border-[#6366f1]/50 bg-[#6366f1]/10" : "border-[#2d3748] hover:border-[#64748b]"}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-xs text-[#e2e8f0] leading-snug">{s.label}</span>
              </div>
            </button>
          ))}
          <button onClick={run} disabled={result.loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] transition-colors disabled:opacity-50 mt-2">
            <Play size={13} />
            {result.loading ? "Analysing with AI…" : "Run AI Analysis"}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <AIPanel title="AI Scenario Analysis" loading={result.loading} error={result.error}
            lastFetched={result.lastFetched} onRefresh={run} color="#6366f1">
            {result.data ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Peak Load Change",  value: `${result.data.peakIncrease > 0 ? "+" : ""}${result.data.peakIncrease}%`, icon: TrendingUp, color: resColor },
                    { label: "DTRs at Risk",       value: String(result.data.dtrsAtRisk),    icon: Zap,         color: result.data.dtrsAtRisk > 0 ? "#ef4444" : "#10b981" },
                    { label: "Upgrades Needed",    value: String(result.data.upgradesNeeded),icon: Wrench,      color: result.data.upgradesNeeded > 0 ? "#f59e0b" : "#10b981" },
                    { label: "Cost Estimate",      value: result.data.costEstimate,          icon: IndianRupee, color: "#6366f1" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-[#0f1117] border border-[#2d3748] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#64748b]">{label}</span>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                          <Icon size={11} style={{ color }} />
                        </div>
                      </div>
                      <div className="text-lg font-bold" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0f1117] border border-[#2d3748] rounded-xl p-3 mb-4">
                  <div className="text-xs font-semibold text-white mb-2">AI Recommendation</div>
                  <div className="text-xs text-[#94a3b8] leading-relaxed">{result.data.recommendation}</div>
                </div>

                <div className="bg-[#0f1117] border border-[#2d3748] rounded-xl p-3">
                  <div className="text-xs font-semibold text-white mb-1">Load Projection</div>
                  <div className="text-[10px] text-[#64748b] mb-3">Baseline vs Scenario · kW peak</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={chartData} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                      <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
                      <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
                      <Bar dataKey="baseline" name="Baseline" fill="#6366f1" opacity={0.6} radius={[3,3,0,0]} />
                      <Bar dataKey="scenario" name="Scenario" fill={resColor} opacity={0.85} radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : !result.loading && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <SlidersHorizontal size={32} className="text-[#2d3748] mb-3" />
                <div className="text-sm text-[#64748b]">Select a scenario and click Run AI Analysis</div>
                <div className="text-xs text-[#64748b] mt-1">Groq LLM will analyse peak load, DTR risk, upgrade needs, and cost</div>
              </div>
            )}
          </AIPanel>
        </div>
      </div>
    </div>
  );
}
