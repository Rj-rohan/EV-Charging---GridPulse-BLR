"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend,
} from "recharts";
import { IndianRupee, TrendingDown, Users } from "lucide-react";
import AIPanel from "@/components/AIPanel";
import { useGroq } from "@/lib/useGroq";
import { prompts, AITariffRecommendation } from "@/lib/groq";

const incentivePoints = [
  { incentive: 0, shift: 4 }, { incentive: 1, shift: 8 }, { incentive: 2, shift: 13 },
  { incentive: 3, shift: 18 }, { incentive: 4, shift: 23 }, { incentive: 5, shift: 27 },
  { incentive: 6, shift: 30 }, { incentive: 7, shift: 32 }, { incentive: 8, shift: 33 },
];

const peakHours = Array.from({ length: 8 }, (_, i) => ({
  time: (18 + i).toString().padStart(2, "0") + ":00",
  baseline: 380 + Math.sin(i * 0.7) * 60,
}));

export default function TariffPage() {
  const [peak, setPeak] = useState(7.5);
  const [offpeak, setOffpeak] = useState(3.8);
  const [incentive, setIncentive] = useState(3);
  const [budget, setBudget] = useState(50000);

  const rec = useGroq<AITariffRecommendation | null>(null);

  useEffect(() => { rec.fetch(prompts.tariffRecommendation(87, 35)); }, []);

  // Apply AI recommendation when loaded
  useEffect(() => {
    if (rec.data) {
      setPeak(rec.data.peakTariff);
      setOffpeak(rec.data.offPeakTariff);
      setIncentive(rec.data.incentive);
    }
  }, [rec.data]);

  const spread = +(peak - offpeak).toFixed(1);
  const shiftPct = incentivePoints.find(p => p.incentive === Math.round(incentive))?.shift ?? 18;
  const dailyCost = incentive * 300 * 0.72;
  const monthlyCost = dailyCost * 30;
  const budgetOk = monthlyCost <= budget;

  const curveData = peakHours.map(d => ({
    ...d,
    withTariff: +(d.baseline * (1 - shiftPct / 100)).toFixed(0),
  }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Tariff & Incentive Engine</h1>
        <p className="text-[#64748b] text-sm mt-1">Time-of-Use pricing · Behavioral economics · Budget-constrained optimization</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Peak Tariff",     value: `₹${peak.toFixed(1)}/kWh`,  color: "#ef4444", icon: IndianRupee },
          { label: "Off-peak Tariff", value: `₹${offpeak.toFixed(1)}/kWh`, color: "#10b981", icon: IndianRupee },
          { label: "Price Spread",    value: `₹${spread}/kWh`,           color: "#f59e0b", icon: TrendingDown },
          { label: "Projected Shift", value: `${shiftPct}%`,             color: "#6366f1", icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#64748b]">{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <AIPanel title="AI Tariff Recommendation" loading={rec.loading} error={rec.error}
        lastFetched={rec.lastFetched} onRefresh={() => rec.fetch(prompts.tariffRecommendation(87, 35))} color="#f59e0b">
        {rec.data ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { label: "Recommended Peak",     value: `₹${rec.data.peakTariff}/kWh`,    color: "#ef4444" },
                { label: "Recommended Off-peak", value: `₹${rec.data.offPeakTariff}/kWh`, color: "#10b981" },
                { label: "Incentive Discount",   value: `₹${rec.data.incentive}/kWh`,     color: "#6366f1" },
                { label: "Projected Shift",      value: `${rec.data.projectedShift}%`,     color: "#00d4aa" },
                { label: "Daily Budget Required",value: `₹${rec.data.budgetRequired}`,    color: "#f59e0b" },
              ].map(r => (
                <div key={r.label} className="bg-[#0f1117] rounded-lg p-2.5 border border-[#2d3748]">
                  <div className="text-[#64748b] mb-1">{r.label}</div>
                  <div className="font-bold" style={{ color: r.color }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg p-3 text-xs text-[#94a3b8] leading-relaxed">
              <span className="text-[#f59e0b] font-semibold">AI Reasoning: </span>{rec.data.reasoning}
            </div>
          </div>
        ) : !rec.loading && (
          <p className="text-xs text-[#64748b] text-center py-4">Click refresh to get AI tariff recommendation</p>
        )}
      </AIPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-5 space-y-5">
          <div className="text-sm font-semibold text-white">Manual Override</div>
          {[
            { label: "Peak Tariff (19:00–22:00)", val: peak, set: setPeak, min: 5, max: 12, step: 0.5, color: "#ef4444", unit: "₹/kWh" },
            { label: "Off-peak (22:00–06:00)",    val: offpeak, set: setOffpeak, min: 2, max: 6, step: 0.2, color: "#10b981", unit: "₹/kWh" },
            { label: "Incentive Discount",        val: incentive, set: setIncentive, min: 0, max: 8, step: 1, color: "#6366f1", unit: "₹/kWh" },
          ].map(({ label, val, set, min, max, step, color, unit }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#64748b]">{label}</span>
                <span className="font-bold" style={{ color }}>₹{val.toFixed(1)}{unit.replace("₹/kWh", "/kWh")}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val}
                onChange={e => set(+e.target.value)} className="w-full" style={{ accentColor: color }} />
            </div>
          ))}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Monthly Budget Cap</span>
              <span className={`font-bold ${budgetOk ? "text-[#10b981]" : "text-[#ef4444]"}`}>₹{budget.toLocaleString()}</span>
            </div>
            <input type="range" min={10000} max={200000} step={5000} value={budget}
              onChange={e => setBudget(+e.target.value)} className="w-full accent-[#f59e0b]" />
          </div>
          <div className={`rounded-lg p-3 text-xs border ${budgetOk ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]" : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"}`}>
            <div className="font-semibold mb-1">{budgetOk ? "✓ Within Budget" : "✗ Exceeds Budget"}</div>
            <div>Monthly cost: ₹{monthlyCost.toLocaleString()}</div>
          </div>
        </div>

        {/* Shift curve */}
        <div className="lg:col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-1">User Shift % vs Incentive Level</div>
          <div className="text-xs text-[#64748b] mb-4">TERI 2019 ToU study · calibrated for Bengaluru</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={incentivePoints} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="incentive" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "Incentive ₹/kWh", fill: "#64748b", fontSize: 11, position: "insideBottom", offset: -2 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
              <ReferenceLine x={Math.round(incentive)} stroke="#6366f1" strokeDasharray="4 2"
                label={{ value: `₹${Math.round(incentive)} → ${shiftPct}%`, fill: "#6366f1", fontSize: 10 }} />
              <Line type="monotone" dataKey="shift" stroke="#00d4aa" strokeWidth={2.5} dot={{ fill: "#00d4aa", r: 3 }} name="Shift %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-1">Evening Peak: Baseline vs With ToU Tariff</div>
        <div className="text-xs text-[#64748b] mb-4">Koramangala feeder · kW</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={curveData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            <Bar dataKey="baseline" name="Baseline" fill="#ef4444" opacity={0.65} radius={[3,3,0,0]} />
            <Bar dataKey="withTariff" name="With ToU" fill="#00d4aa" opacity={0.85} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
