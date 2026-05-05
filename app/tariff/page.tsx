"use client";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend,
} from "recharts";
import { IndianRupee, TrendingDown, Users, Wallet } from "lucide-react";

const incentivePoints = [
  { incentive: 0,  shift: 4,  users: 12,  cost: 0 },
  { incentive: 1,  shift: 8,  users: 24,  cost: 24 },
  { incentive: 2,  shift: 13, users: 39,  cost: 78 },
  { incentive: 3,  shift: 18, users: 54,  cost: 162 },
  { incentive: 4,  shift: 23, users: 69,  cost: 276 },
  { incentive: 5,  shift: 27, users: 81,  cost: 405 },
  { incentive: 6,  shift: 30, users: 90,  cost: 540 },
  { incentive: 7,  shift: 32, users: 96,  cost: 672 },
  { incentive: 8,  shift: 33, users: 99,  cost: 792 },
];

const peakHours = Array.from({ length: 8 }, (_, i) => {
  const h = (18 + i).toString().padStart(2, "0") + ":00";
  return { time: h, baseline: 380 + Math.sin(i * 0.7) * 60 };
});

function buildTariffCurve(peak: number, offpeak: number, incentive: number) {
  const shiftPct = incentivePoints.find(p => p.incentive === incentive)?.shift ?? 18;
  return peakHours.map(d => ({
    ...d,
    withTariff: +(d.baseline * (1 - shiftPct / 100)).toFixed(0),
    tariffRate: d.time >= "19:00" && d.time <= "21:00" ? peak : offpeak,
  }));
}

export default function TariffPage() {
  const [peak, setPeak] = useState(7.5);
  const [offpeak, setOffpeak] = useState(3.8);
  const [incentive, setIncentive] = useState(3);
  const [budget, setBudget] = useState(50000);

  const spread = +(peak - offpeak).toFixed(1);
  const simPoint = incentivePoints.find(p => p.incentive === incentive)!;
  const dailyCost = simPoint.cost;
  const monthlyCost = dailyCost * 30;
  const budgetOk = monthlyCost <= budget;
  const curveData = buildTariffCurve(peak, offpeak, incentive);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Tariff & Incentive Engine</h1>
        <p className="text-[#64748b] text-sm mt-1">Time-of-Use pricing · Behavioral economics · Budget-constrained optimization</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Peak Tariff",      value: `₹${peak}/kWh`,       color: "#ef4444", icon: IndianRupee },
          { label: "Off-peak Tariff",  value: `₹${offpeak}/kWh`,    color: "#10b981", icon: IndianRupee },
          { label: "Price Spread",     value: `₹${spread}/kWh`,     color: "#f59e0b", icon: TrendingDown },
          { label: "Projected Shift",  value: `${simPoint.shift}%`, color: "#6366f1", icon: Users },
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

      <div className="grid grid-cols-3 gap-4">
        {/* Controls */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-5 space-y-5">
          <div className="text-sm font-semibold text-white">Tariff Configuration</div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Peak Tariff (19:00–22:00)</span>
              <span className="text-[#ef4444] font-bold">₹{peak.toFixed(1)}/kWh</span>
            </div>
            <input type="range" min={5} max={12} step={0.5} value={peak}
              onChange={e => setPeak(+e.target.value)} className="w-full accent-[#ef4444]" />
            <div className="flex justify-between text-[10px] text-[#64748b] mt-1"><span>₹5</span><span>₹12</span></div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Off-peak Tariff (22:00–06:00)</span>
              <span className="text-[#10b981] font-bold">₹{offpeak.toFixed(1)}/kWh</span>
            </div>
            <input type="range" min={2} max={6} step={0.2} value={offpeak}
              onChange={e => setOffpeak(+e.target.value)} className="w-full accent-[#10b981]" />
            <div className="flex justify-between text-[10px] text-[#64748b] mt-1"><span>₹2</span><span>₹6</span></div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Incentive Discount</span>
              <span className="text-[#6366f1] font-bold">₹{incentive}/kWh</span>
            </div>
            <input type="range" min={0} max={8} step={1} value={incentive}
              onChange={e => setIncentive(+e.target.value)} className="w-full accent-[#6366f1]" />
            <div className="flex justify-between text-[10px] text-[#64748b] mt-1"><span>₹0</span><span>₹8</span></div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Monthly Budget Cap</span>
              <span className={`font-bold ${budgetOk ? "text-[#10b981]" : "text-[#ef4444]"}`}>₹{budget.toLocaleString()}</span>
            </div>
            <input type="range" min={10000} max={200000} step={5000} value={budget}
              onChange={e => setBudget(+e.target.value)} className="w-full accent-[#f59e0b]" />
            <div className="flex justify-between text-[10px] text-[#64748b] mt-1"><span>₹10K</span><span>₹2L</span></div>
          </div>

          {/* Budget status */}
          <div className={`rounded-lg p-3 text-xs border ${budgetOk ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]" : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"}`}>
            <div className="font-semibold mb-1">{budgetOk ? "✓ Within Budget" : "✗ Exceeds Budget"}</div>
            <div>Daily cost: ₹{dailyCost.toLocaleString()}</div>
            <div>Monthly cost: ₹{monthlyCost.toLocaleString()}</div>
            <div>Budget: ₹{budget.toLocaleString()}</div>
          </div>
        </div>

        {/* Shift vs incentive curve */}
        <div className="col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-1">User Shift % vs Incentive Level</div>
          <div className="text-xs text-[#64748b] mb-4">Based on TERI 2019 Delhi ToU study · calibrated for Bengaluru</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={incentivePoints} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="incentive" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "Incentive ₹/kWh", fill: "#64748b", fontSize: 11, position: "insideBottom", offset: -2 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
                formatter={(v, n) => [n === "shift" ? `${v}%` : `₹${v}`, n === "shift" ? "Users Shifted" : "Daily Cost"]} />
              <ReferenceLine x={incentive} stroke="#6366f1" strokeDasharray="4 2"
                label={{ value: `₹${incentive} → ${simPoint.shift}%`, fill: "#6366f1", fontSize: 10 }} />
              <Line type="monotone" dataKey="shift" stroke="#00d4aa" strokeWidth={2.5} dot={{ fill: "#00d4aa", r: 3 }} name="shift" />
            </LineChart>
          </ResponsiveContainer>

          {/* Simulation callouts */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { inc: 3, shift: 18, label: "Conservative" },
              { inc: 5, shift: 27, label: "Recommended" },
              { inc: 7, shift: 32, label: "Aggressive" },
            ].map(s => (
              <button key={s.inc} onClick={() => setIncentive(s.inc)}
                className={`rounded-lg p-3 text-left border transition-all ${incentive === s.inc ? "border-[#6366f1]/60 bg-[#6366f1]/10" : "border-[#2d3748] bg-[#0f1117] hover:border-[#64748b]"}`}>
                <div className="text-[10px] text-[#64748b]">{s.label}</div>
                <div className="text-sm font-bold text-white mt-0.5">₹{s.inc} incentive</div>
                <div className="text-xs text-[#00d4aa]">→ {s.shift}% shift</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Peak flattening chart */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-1">Evening Peak: Baseline vs With ToU Tariff</div>
        <div className="text-xs text-[#64748b] mb-4">Koramangala feeder · kW · 18:00–01:00</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={curveData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            <Bar dataKey="baseline"   name="Baseline"      fill="#ef4444" opacity={0.65} radius={[3,3,0,0]} />
            <Bar dataKey="withTariff" name="With ToU"      fill="#00d4aa" opacity={0.85} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
