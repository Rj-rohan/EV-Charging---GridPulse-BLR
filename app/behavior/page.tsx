"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

const overallStats = [
  { label: "Acceptance Rate",  value: "64%", color: "#10b981", icon: CheckCircle },
  { label: "Modified Rate",    value: "18%", color: "#f59e0b", icon: Clock },
  { label: "Ignore Rate",      value: "18%", color: "#ef4444", icon: XCircle },
  { label: "Total Users Nudged", value: "1,247", color: "#6366f1", icon: Users },
];

const byArea = [
  { area: "Koramangala", accept: 71, modify: 16, ignore: 13 },
  { area: "HSR Layout",  accept: 68, modify: 19, ignore: 13 },
  { area: "Whitefield",  accept: 60, modify: 21, ignore: 19 },
  { area: "Sarjapur",    accept: 58, modify: 17, ignore: 25 },
  { area: "E-City",      accept: 65, modify: 18, ignore: 17 },
  { area: "Marathahalli",accept: 62, modify: 20, ignore: 18 },
];

const byIncome = [
  { group: "High (>₹15L)",   accept: 55, modify: 22, ignore: 23 },
  { group: "Mid (₹5–15L)",   accept: 68, modify: 18, ignore: 14 },
  { group: "Low (<₹5L)",     accept: 72, modify: 14, ignore: 14 },
];

const byCharger = [
  { type: "Home 3.3kW",  accept: 72, modify: 15, ignore: 13 },
  { type: "Home 7.4kW",  accept: 61, modify: 20, ignore: 19 },
  { type: "Workplace",   accept: 58, modify: 24, ignore: 18 },
  { type: "Public DC",   accept: 38, modify: 18, ignore: 44 },
];

const clusters = [
  { name: "Flexible Users",  count: 498, pct: 40, color: "#10b981", desc: "Accept >80% of nudges · Depart after 09:00 · High price sensitivity" },
  { name: "Rigid Users",     count: 311, pct: 25, color: "#ef4444", desc: "Ignore >60% of nudges · Early departure · Low price sensitivity" },
  { name: "Night Chargers",  count: 374, pct: 30, color: "#6366f1", desc: "Naturally charge 23:00–05:00 · No nudge needed · Grid-friendly" },
  { name: "Opportunistic",   count: 64,  pct: 5,  color: "#f59e0b", desc: "Respond only to large incentives (>₹5/kWh) · Fleet operators" },
];

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

type Tab = "area" | "income" | "charger";

export default function BehaviorPage() {
  const [tab, setTab] = useState<Tab>("area");

  const tableData = tab === "area" ? byArea.map(d => ({ key: d.area, ...d }))
    : tab === "income" ? byIncome.map(d => ({ key: d.group, ...d }))
    : byCharger.map(d => ({ key: d.type, ...d }));

  const chartData = tableData.map(d => ({ name: d.key, Accept: d.accept, Modify: d.modify, Ignore: d.ignore }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">User Behavior Analytics</h1>
        <p className="text-[#64748b] text-sm mt-1">Acceptance patterns · Cluster segmentation · Contextual bandit feedback loop</p>
      </div>

      {/* Overall */}
      <div className="grid grid-cols-4 gap-4">
        {overallStats.map(({ label, value, color, icon: Icon }) => (
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
        {/* Pie */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-4">Overall Response Split</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[{ name: "Accept", value: 64 }, { name: "Modify", value: 18 }, { name: "Ignore", value: 18 }]}
                cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
                formatter={(v) => [`${v}%`]} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown chart */}
        <div className="col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Response by Segment</div>
            <div className="flex gap-1">
              {(["area", "income", "charger"] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all capitalize ${tab === t ? "bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/40" : "text-[#64748b] border border-[#2d3748] hover:border-[#64748b]"}`}>
                  {t === "area" ? "By Area" : t === "income" ? "By Income" : "By Charger"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} unit="%" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
                formatter={(v) => [`${v}%`]} />
              <Bar dataKey="Accept" stackId="a" fill="#10b981" radius={[0,0,0,0]} />
              <Bar dataKey="Modify" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Ignore" stackId="a" fill="#ef4444" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User clusters */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-4">User Clusters — Contextual Bandit Segmentation</div>
        <div className="grid grid-cols-4 gap-3">
          {clusters.map(c => (
            <div key={c.name} className="rounded-xl p-4 border" style={{ background: `${c.color}0d`, borderColor: `${c.color}30` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: c.color }}>{c.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${c.color}20`, color: c.color }}>{c.pct}%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{c.count.toLocaleString()}</div>
              <div className="text-[10px] text-[#64748b] leading-relaxed">{c.desc}</div>
              <div className="mt-2 h-1 bg-[#2d3748] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.pct * 2}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight callouts */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Night Chargers need no nudge", body: "30% of users already charge off-peak. Targeting only the remaining 70% reduces notification fatigue and improves acceptance rates.", color: "#6366f1" },
          { title: "Low-income users most responsive", body: "Users in the <₹5L bracket show 72% acceptance — highest of any group. Price sensitivity is the primary driver, not convenience.", color: "#10b981" },
          { title: "Public DC chargers resist shifting", body: "Only 38% acceptance for public DC users. These are destination chargers — mobility constraint is binding. Exclude from nudge campaigns.", color: "#f59e0b" },
        ].map(i => (
          <div key={i.title} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="text-xs font-bold mb-2" style={{ color: i.color }}>{i.title}</div>
            <div className="text-xs text-[#94a3b8] leading-relaxed">{i.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
