"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine,
} from "recharts";
import { SlidersHorizontal, TrendingUp, Zap, Wrench, IndianRupee, Play } from "lucide-react";

const scenarios = [
  { id: "ev-double",   label: "EV adoption doubles in 2 years",       icon: "🚗" },
  { id: "fast-charge", label: "500 fast chargers added in Whitefield", icon: "⚡" },
  { id: "fleet",       label: "Ola deploys 200 fast chargers (ORR)",   icon: "🛵" },
  { id: "solar",       label: "Rooftop solar 30% penetration",         icon: "☀️" },
];

type ScenarioId = "ev-double" | "fast-charge" | "fleet" | "solar";

const results: Record<ScenarioId, {
  peakIncrease: number; dtrsAtRisk: number; upgradesNeeded: number;
  costEstimate: string; recommendation: string; color: string;
  chartData: { year: string; baseline: number; scenario: number }[];
}> = {
  "ev-double": {
    peakIncrease: 34, dtrsAtRisk: 47, upgradesNeeded: 12,
    costEstimate: "₹18.4 Cr",
    recommendation: "Phase transformer upgrades in Koramangala, HSR, Whitefield by Q3 2026. Deploy scheduling nudges immediately to buy 18 months.",
    color: "#ef4444",
    chartData: [
      { year: "2024", baseline: 380, scenario: 380 },
      { year: "2025", baseline: 400, scenario: 440 },
      { year: "2026", baseline: 420, scenario: 510 },
    ],
  },
  "fast-charge": {
    peakIncrease: 22, dtrsAtRisk: 8, upgradesNeeded: 3,
    costEstimate: "₹4.2 Cr",
    recommendation: "Whitefield feeder F-12 and F-14 need upgrade. Stagger charger activation times using OCPI API. 3 DTR upgrades sufficient.",
    color: "#f59e0b",
    chartData: [
      { year: "Now",    baseline: 380, scenario: 380 },
      { year: "+6mo",   baseline: 390, scenario: 420 },
      { year: "+12mo",  baseline: 400, scenario: 463 },
    ],
  },
  "fleet": {
    peakIncrease: 18, dtrsAtRisk: 5, upgradesNeeded: 2,
    costEstimate: "₹2.8 Cr",
    recommendation: "Fleet depot charging must be shifted to 01:00–05:00 via fleet operator API. 2 DTR upgrades on ORR. V2G-ready spec recommended.",
    color: "#f59e0b",
    chartData: [
      { year: "Now",   baseline: 380, scenario: 380 },
      { year: "+3mo",  baseline: 385, scenario: 410 },
      { year: "+6mo",  baseline: 390, scenario: 448 },
    ],
  },
  "solar": {
    peakIncrease: -12, dtrsAtRisk: 0, upgradesNeeded: 0,
    costEstimate: "₹0 (net benefit)",
    recommendation: "Solar penetration reduces midday load and enables daytime EV charging. Recommend incentivizing solar+EV combo. No upgrades needed.",
    color: "#10b981",
    chartData: [
      { year: "2024", baseline: 380, scenario: 380 },
      { year: "2025", baseline: 400, scenario: 370 },
      { year: "2026", baseline: 420, scenario: 355 },
    ],
  },
};

export default function WhatIfPage() {
  const [selected, setSelected] = useState<ScenarioId>("ev-double");
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);

  const res = results[selected];

  function run() {
    setRunning(true);
    setRan(false);
    setTimeout(() => { setRunning(false); setRan(true); }, 1500);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Scenario Planner</h1>
        <p className="text-[#64748b] text-sm mt-1">What-if analysis · SUMO digital twin · Decision-maker ready outputs</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Scenario picker */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 space-y-3">
          <div className="text-sm font-semibold text-white">Choose Scenario</div>
          {scenarios.map(s => (
            <button key={s.id} onClick={() => { setSelected(s.id as ScenarioId); setRan(false); }}
              className={`w-full text-left rounded-xl p-3 border transition-all ${selected === s.id ? "border-[#6366f1]/50 bg-[#6366f1]/10" : "border-[#2d3748] hover:border-[#64748b]"}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-xs text-[#e2e8f0] leading-snug">{s.label}</span>
              </div>
            </button>
          ))}
          <button onClick={run} disabled={running}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] transition-colors disabled:opacity-50 mt-2">
            <Play size={13} />
            {running ? "Running…" : "Run Scenario"}
          </button>
        </div>

        {/* Results */}
        <div className="col-span-2 space-y-4">
          {ran ? (
            <>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Peak Load Change",      value: `${res.peakIncrease > 0 ? "+" : ""}${res.peakIncrease}%`, icon: TrendingUp, color: res.color },
                  { label: "DTRs at Risk",           value: String(res.dtrsAtRisk),    icon: Zap,          color: res.dtrsAtRisk > 0 ? "#ef4444" : "#10b981" },
                  { label: "Upgrades Needed",        value: String(res.upgradesNeeded),icon: Wrench,       color: res.upgradesNeeded > 0 ? "#f59e0b" : "#10b981" },
                  { label: "Cost Estimate",          value: res.costEstimate,          icon: IndianRupee,  color: "#6366f1" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-3">
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

              <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
                <div className="text-sm font-semibold text-white mb-1">Load Projection</div>
                <div className="text-xs text-[#64748b] mb-3">Baseline vs Scenario · kW peak</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={res.chartData} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
                    <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
                    <Bar dataKey="baseline" name="Baseline" fill="#6366f1" opacity={0.6} radius={[3,3,0,0]} />
                    <Bar dataKey="scenario" name="Scenario"  fill={res.color}  opacity={0.85} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
                <div className="text-xs font-semibold text-white mb-2">AI Recommendation</div>
                <div className="text-xs text-[#94a3b8] leading-relaxed">{res.recommendation}</div>
              </div>
            </>
          ) : (
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-8 flex flex-col items-center justify-center h-full text-center">
              <SlidersHorizontal size={32} className="text-[#2d3748] mb-3" />
              <div className="text-sm text-[#64748b]">Select a scenario and click Run Scenario</div>
              <div className="text-xs text-[#64748b] mt-1">Results include peak load change, DTR risk, upgrade count, and cost estimate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
