"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { Wrench, IndianRupee, TrendingUp, AlertTriangle } from "lucide-react";

const transformers = [
  { id: "DTR-114", ward: "Koramangala 5B", age: 18, load: 94, capacity: 400, upgradeCapacity: 630, upgradeCost: 28, demandShiftSaving: 8,  priority: "critical", roi: 3.2 },
  { id: "DTR-089", ward: "Sarjapur Rd",    age: 14, load: 87, capacity: 315, upgradeCapacity: 500, upgradeCost: 22, demandShiftSaving: 12, priority: "critical", roi: 2.8 },
  { id: "DTR-278", ward: "Marathahalli",   age: 11, load: 81, capacity: 500, upgradeCapacity: 630, upgradeCost: 18, demandShiftSaving: 14, priority: "high",     roi: 2.1 },
  { id: "DTR-412", ward: "Indiranagar",    age: 9,  load: 70, capacity: 315, upgradeCapacity: 500, upgradeCost: 22, demandShiftSaving: 18, priority: "medium",   roi: 1.4 },
  { id: "DTR-731", ward: "Hebbal",         age: 7,  load: 67, capacity: 315, upgradeCapacity: 500, upgradeCost: 22, demandShiftSaving: 20, priority: "medium",   roi: 1.1 },
  { id: "DTR-203", ward: "HSR Layout",     age: 6,  load: 76, capacity: 500, upgradeCapacity: 630, upgradeCost: 18, demandShiftSaving: 16, priority: "high",     roi: 1.8 },
];

const comparisonData = transformers.map(t => ({
  dtr: t.id,
  "Upgrade Cost (₹L)": t.upgradeCost,
  "Demand Shift Saving (₹L/yr)": t.demandShiftSaving,
}));

const scatterData = transformers.map(t => ({
  x: t.upgradeCost,
  y: t.roi,
  z: t.load,
  name: t.id,
}));

const priorityColor: Record<string, string> = {
  critical: "#ef4444", high: "#f59e0b", medium: "#6366f1", low: "#10b981"
};

export default function CapexPage() {
  const totalUpgradeCost = transformers.filter(t => t.priority === "critical" || t.priority === "high")
    .reduce((s, t) => s + t.upgradeCost, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Asset Upgrade Planning</h1>
        <p className="text-[#64748b] text-sm mt-1">Transformer upgrade prioritization · Cost vs benefit · Upgrade vs demand-shifting comparison</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Critical Upgrades",    value: String(transformers.filter(t => t.priority === "critical").length), color: "#ef4444", icon: AlertTriangle },
          { label: "High Priority",         value: String(transformers.filter(t => t.priority === "high").length),     color: "#f59e0b", icon: Wrench },
          { label: "Total Upgrade Cost",    value: `₹${totalUpgradeCost}L`,                                            color: "#6366f1", icon: IndianRupee },
          { label: "Avg ROI (years)",       value: `${(transformers.reduce((s,t)=>s+t.roi,0)/transformers.length).toFixed(1)}y`, color: "#10b981", icon: TrendingUp },
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

      {/* Upgrade table */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-4">Transformer Upgrade Priority List</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[#64748b] border-b border-[#2d3748]">
              <th className="text-left pb-2">DTR</th>
              <th className="text-left pb-2">Ward</th>
              <th className="text-right pb-2">Age (yr)</th>
              <th className="text-right pb-2">Load %</th>
              <th className="text-right pb-2">Current kVA</th>
              <th className="text-right pb-2">Upgrade to kVA</th>
              <th className="text-right pb-2">Cost (₹L)</th>
              <th className="text-right pb-2">ROI (yr)</th>
              <th className="text-center pb-2">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d3748]">
            {transformers.map(t => (
              <tr key={t.id}>
                <td className="py-2.5 font-mono text-[#6366f1]">{t.id}</td>
                <td className="py-2.5 text-[#e2e8f0]">{t.ward}</td>
                <td className="py-2.5 text-right text-[#94a3b8]">{t.age}</td>
                <td className="py-2.5 text-right">
                  <span style={{ color: t.load >= 90 ? "#ef4444" : t.load >= 75 ? "#f59e0b" : "#10b981" }}>{t.load}%</span>
                </td>
                <td className="py-2.5 text-right text-[#94a3b8]">{t.capacity}</td>
                <td className="py-2.5 text-right text-[#00d4aa]">{t.upgradeCapacity}</td>
                <td className="py-2.5 text-right text-white font-semibold">₹{t.upgradeCost}L</td>
                <td className="py-2.5 text-right text-[#10b981]">{t.roi}y</td>
                <td className="py-2.5 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                    style={{ background: `${priorityColor[t.priority]}20`, color: priorityColor[t.priority] }}>
                    {t.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Upgrade vs demand shift */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-1">Upgrade Cost vs Demand-Shift Saving</div>
          <div className="text-xs text-[#64748b] mb-4">₹ Lakhs · Annual saving from scheduling nudges vs one-time upgrade cost</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="dtr" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="L" />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
              <Bar dataKey="Upgrade Cost (₹L)"           fill="#ef4444" opacity={0.75} radius={[3,3,0,0]} />
              <Bar dataKey="Demand Shift Saving (₹L/yr)" fill="#10b981" opacity={0.85} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-2 bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg text-[10px] text-[#94a3b8]">
            For DTR-412 and DTR-731, demand-shifting alone recovers cost within 1.1–1.4 years — upgrade can be deferred 2–3 years.
          </div>
        </div>

        {/* Cost vs ROI scatter */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-1">Cost vs ROI · Bubble = Load %</div>
          <div className="text-xs text-[#64748b] mb-4">Larger bubble = higher current load</div>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="x" name="Cost" unit="L" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "Cost (₹L)", fill: "#64748b", fontSize: 10, position: "insideBottom", offset: -2 }} />
              <YAxis dataKey="y" name="ROI" unit="y" tick={{ fill: "#64748b", fontSize: 11 }} />
              <ZAxis dataKey="z" range={[40, 200]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
                formatter={(v, n) => [`${v}${n === "ROI" ? "y" : n === "Cost" ? "L" : "%"}`, String(n)]} />
              <Scatter data={scatterData} fill="#6366f1" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
