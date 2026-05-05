"use client";
import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis
} from "recharts";
import { MapPin, Zap, Users, TrendingUp, Info } from "lucide-react";

const candidates = [
  { id: "HEX-0041", ward: "Koramangala 5th Block", evDensity: 88, feederHeadroom: 72, dwellTime: 85, equity: 60, landAvail: 78, v2gReady: true, score: 91, rank: 1 },
  { id: "HEX-0187", ward: "HSR Layout Sec 2", evDensity: 82, feederHeadroom: 85, dwellTime: 70, equity: 55, landAvail: 65, v2gReady: true, score: 88, rank: 2 },
  { id: "HEX-0312", ward: "Whitefield Main Rd", evDensity: 91, feederHeadroom: 60, dwellTime: 90, equity: 45, landAvail: 55, v2gReady: false, score: 85, rank: 3 },
  { id: "HEX-0509", ward: "Electronic City Ph1", evDensity: 75, feederHeadroom: 90, dwellTime: 65, equity: 70, landAvail: 88, v2gReady: true, score: 83, rank: 4 },
  { id: "HEX-0623", ward: "Marathahalli Bridge", evDensity: 79, feederHeadroom: 68, dwellTime: 88, equity: 50, landAvail: 60, v2gReady: false, score: 80, rank: 5 },
  { id: "HEX-0741", ward: "Sarjapur Rd Junction", evDensity: 70, feederHeadroom: 75, dwellTime: 72, equity: 80, landAvail: 70, v2gReady: true, score: 78, rank: 6 },
  { id: "HEX-0892", ward: "Bannerghatta Rd", evDensity: 55, feederHeadroom: 82, dwellTime: 60, equity: 88, landAvail: 85, v2gReady: false, score: 72, rank: 7 },
];

const paretoData = [
  { utilization: 95, coverage: 62, stations: 50 },
  { utilization: 88, coverage: 71, stations: 80 },
  { utilization: 80, coverage: 79, stations: 110 },
  { utilization: 72, coverage: 85, stations: 140 },
  { utilization: 65, coverage: 90, stations: 170 },
  { utilization: 58, coverage: 94, stations: 200 },
];

const shapFeatures = [
  { feature: "EV Density 2027", value: 0.31 },
  { feature: "Feeder Headroom", value: 0.24 },
  { feature: "Dwell Time", value: 0.19 },
  { feature: "Land Availability", value: 0.13 },
  { feature: "Equity Weight", value: 0.08 },
  { feature: "DTR Distance", value: 0.05 },
];

export default function SitingPage() {
  const [selected, setSelected] = useState(candidates[0]);
  const [utilWeight, setUtilWeight] = useState(60);

  const radarData = [
    { subject: "EV Density", value: selected.evDensity },
    { subject: "Feeder Headroom", value: selected.feederHeadroom },
    { subject: "Dwell Time", value: selected.dwellTime },
    { subject: "Equity", value: selected.equity },
    { subject: "Land Avail", value: selected.landAvail },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Siting Engine</h1>
        <p className="text-[#64748b] text-sm mt-1">
          NSGA-II Multi-objective · 500m Hex Grid · BBMP Coverage · SHAP Explainability
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: MapPin, label: "Candidate Hexcells", value: "4,812", color: "#f59e0b" },
          { icon: Zap, label: "Top Recommendations", value: "247", color: "#00d4aa" },
          { icon: TrendingUp, label: "Demand Coverage (2027)", value: "90%", color: "#6366f1" },
          { icon: Users, label: "Fewer Stations vs Uniform", value: "−30%", color: "#10b981" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#64748b]">{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pareto frontier */}
        <div className="lg:col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-semibold text-white">Pareto Frontier — Utilization vs Coverage</div>
          </div>
          <div className="text-xs text-[#64748b] mb-2">Slide to explore trade-off · Bubble size = station count</div>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#64748b]">Maximize Utilization ←→ Maximize Equitable Coverage</span>
              <span className="text-[#00d4aa]">{utilWeight}%</span>
            </div>
            <input type="range" min={0} max={100} value={utilWeight} onChange={(e) => setUtilWeight(+e.target.value)}
              className="w-full accent-[#00d4aa]" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="utilization" name="Utilization" unit="%" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "Utilization %", fill: "#64748b", fontSize: 11, position: "insideBottom", offset: -2 }} />
              <YAxis dataKey="coverage" name="Coverage" unit="%" tick={{ fill: "#64748b", fontSize: 11 }} />
              <ZAxis dataKey="stations" range={[60, 300]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
                formatter={(v, n) => [`${v}${n === "stations" ? "" : "%"}`, n]} />
              <Scatter data={paretoData} fill="#00d4aa" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* SHAP panel */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Info size={14} className="text-[#6366f1]" />
            <span className="text-sm font-semibold text-white">SHAP Explanation</span>
          </div>
          <div className="text-xs text-[#64748b] mb-3">{selected.id} · {selected.ward}</div>
          <div className="space-y-2.5">
            {shapFeatures.map((f) => (
              <div key={f.feature}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#94a3b8]">{f.feature}</span>
                  <span className="text-[#00d4aa]">{(f.value * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-[#2d3748] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00d4aa] rounded-full" style={{ width: `${f.value * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-2 bg-[#0f1117] rounded-lg text-[10px] text-[#64748b]">
            EV density and feeder headroom are the primary drivers for this recommendation. Suitable for Sub-Division officer council presentation.
          </div>
        </div>
      </div>

      {/* Candidates table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 overflow-x-auto">
          <div className="text-sm font-semibold text-white mb-4">Top Siting Recommendations</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#64748b] border-b border-[#2d3748]">
                <th className="text-left pb-2">Rank</th>
                <th className="text-left pb-2">Hex ID</th>
                <th className="text-left pb-2">Ward</th>
                <th className="text-right pb-2">Score</th>
                <th className="text-right pb-2">V2G Ready</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3748]">
              {candidates.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)}
                  className={`cursor-pointer transition-colors ${selected.id === c.id ? "bg-[#00d4aa]/5" : "hover:bg-[#2d3748]/40"}`}>
                  <td className="py-2.5 text-[#64748b]">#{c.rank}</td>
                  <td className="py-2.5 font-mono text-[#6366f1]">{c.id}</td>
                  <td className="py-2.5 text-[#e2e8f0]">{c.ward}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-[#00d4aa] font-bold">{c.score}</span>
                    <span className="text-[#64748b]">/100</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.v2gReady ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#64748b]/20 text-[#64748b]"}`}>
                      {c.v2gReady ? "Yes (2028)" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Radar */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-1">Feature Radar</div>
          <div className="text-xs text-[#64748b] mb-2">{selected.ward}</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2d3748" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
              <Radar dataKey="value" stroke="#00d4aa" fill="#00d4aa" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
