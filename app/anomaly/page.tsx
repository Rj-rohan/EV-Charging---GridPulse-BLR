"use client";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { ScanSearch, AlertTriangle, Zap, UserX, TrendingUp } from "lucide-react";

const anomalies = [
  { id: "ANO-001", type: "Tariff Gaming",         user: "U-4821", ward: "Koramangala", detail: "Charging pattern shifted exactly at tariff boundary for 14 consecutive days. Probability of gaming: 94%.", severity: "high",   time: "Today 19:42",  status: "open" },
  { id: "ANO-002", type: "Unauthorized Charger",  user: "DTR-089",ward: "Sarjapur",    detail: "Load spike of +42 kW at 20:15 with no registered EV in 200m radius. Possible unregistered fast charger.", severity: "high",   time: "Today 20:15",  status: "open" },
  { id: "ANO-003", type: "Abnormal Load Spike",   user: "DTR-278",ward: "Marathahalli",detail: "Load increased 38% in 4 minutes at 19:58. Exceeds 3σ threshold. Possible simultaneous fleet activation.", severity: "medium", time: "Today 19:58",  status: "investigating" },
  { id: "ANO-004", type: "Tariff Gaming",         user: "U-2234", ward: "HSR Layout",  detail: "User consistently charges 2 minutes after off-peak window opens. Pattern detected over 21 days.", severity: "medium", time: "Yesterday",    status: "resolved" },
  { id: "ANO-005", type: "Abnormal Load Spike",   user: "DTR-412",ward: "Indiranagar", detail: "Spike at 21:30 — 28% above forecast. Correlated with new apartment complex move-in.", severity: "low",    time: "2 days ago",   status: "resolved" },
  { id: "ANO-006", type: "Unauthorized Charger",  user: "DTR-156",ward: "Whitefield",  detail: "Recurring 11 kW load signature at 22:00 not matching any registered charger. Possible commercial use.", severity: "medium", time: "3 days ago",   status: "investigating" },
];

const loadSpike = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0") + ":00";
  const base = 200 + Math.sin((i - 6) * 0.4) * 60;
  const spike = i === 20 ? base + 85 : base;
  const upper = base + 30;
  const lower = base - 30;
  return { time: h, load: +spike.toFixed(0), upper: +upper.toFixed(0), lower: +lower.toFixed(0) };
});

const gamingPattern = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  startTime: 22 + (Math.random() < 0.85 ? 0 : (Math.random() - 0.5) * 2),
  sessions: 1,
}));

const severityColor: Record<string, string> = {
  high: "#ef4444", medium: "#f59e0b", low: "#64748b"
};
const statusStyle: Record<string, { bg: string; color: string }> = {
  open:          { bg: "#ef444420", color: "#ef4444" },
  investigating: { bg: "#f59e0b20", color: "#f59e0b" },
  resolved:      { bg: "#10b98120", color: "#10b981" },
};

export default function AnomalyPage() {
  const [selected, setSelected] = useState(anomalies[0]);
  const [filter, setFilter] = useState<"all" | "open" | "investigating">("all");

  const filtered = anomalies.filter(a => filter === "all" || a.status === filter);
  const openCount = anomalies.filter(a => a.status === "open").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Anomaly & Fraud Detection</h1>
        <p className="text-[#64748b] text-sm mt-1">Tariff gaming · Unauthorized chargers · Abnormal load spikes · 3σ threshold detection</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open Anomalies",       value: String(openCount),                                                    color: "#ef4444", icon: AlertTriangle },
          { label: "Tariff Gaming Cases",  value: String(anomalies.filter(a => a.type === "Tariff Gaming").length),     color: "#f59e0b", icon: UserX },
          { label: "Unauthorized Chargers",value: String(anomalies.filter(a => a.type === "Unauthorized Charger").length), color: "#6366f1", icon: Zap },
          { label: "Load Spikes (7d)",     value: String(anomalies.filter(a => a.type === "Abnormal Load Spike").length), color: "#ec4899", icon: TrendingUp },
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
        {/* Anomaly list */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-white">Detected Anomalies</div>
          </div>
          <div className="flex gap-1 mb-3">
            {(["all", "open", "investigating"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[10px] capitalize transition-all ${filter === f ? "bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/40" : "text-[#64748b] border border-[#2d3748]"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map(a => (
              <button key={a.id} onClick={() => setSelected(a)}
                className={`w-full text-left rounded-lg p-3 border transition-all ${selected.id === a.id ? "border-[#6366f1]/50 bg-[#6366f1]/10" : "border-[#2d3748] hover:border-[#64748b]"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold" style={{ color: severityColor[a.severity] }}>{a.type}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: statusStyle[a.status].bg, color: statusStyle[a.status].color }}>
                    {a.status}
                  </span>
                </div>
                <div className="text-[10px] text-[#64748b]">{a.ward} · {a.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail + charts */}
        <div className="col-span-2 space-y-4">
          {/* Detail card */}
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{selected.type}</span>
                  <span className="text-[10px] font-mono text-[#6366f1]">{selected.id}</span>
                </div>
                <div className="text-xs text-[#64748b]">{selected.ward} · {selected.time}</div>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full font-bold capitalize"
                  style={{ background: `${severityColor[selected.severity]}20`, color: severityColor[selected.severity] }}>
                  {selected.severity}
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full capitalize"
                  style={{ background: statusStyle[selected.status].bg, color: statusStyle[selected.status].color }}>
                  {selected.status}
                </span>
              </div>
            </div>
            <div className="text-xs text-[#94a3b8] leading-relaxed bg-[#0f1117] rounded-lg p-3 border border-[#2d3748]">
              {selected.detail}
            </div>
          </div>

          {/* Load spike chart */}
          {selected.type === "Abnormal Load Spike" && (
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
              <div className="text-sm font-semibold text-white mb-1">Load vs 3σ Bounds — {selected.user}</div>
              <div className="text-xs text-[#64748b] mb-3">Red spike = anomaly · Shaded = normal range</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={loadSpike} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
                  <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
                  <ReferenceLine x="20:00" stroke="#ef4444" strokeDasharray="4 2"
                    label={{ value: "Spike", fill: "#ef4444", fontSize: 10 }} />
                  <Line type="monotone" dataKey="upper" stroke="#2d3748" strokeWidth={1} dot={false} name="Upper 3σ" />
                  <Line type="monotone" dataKey="lower" stroke="#2d3748" strokeWidth={1} dot={false} name="Lower 3σ" />
                  <Line type="monotone" dataKey="load"  stroke="#00d4aa" strokeWidth={2} dot={false} name="Load" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gaming pattern */}
          {selected.type === "Tariff Gaming" && (
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
              <div className="text-sm font-semibold text-white mb-1">Charging Start Time — {selected.user}</div>
              <div className="text-xs text-[#64748b] mb-3">30-day history · Cluster at 22:00 boundary = gaming signal</div>
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 9 }} interval={4} />
                  <YAxis dataKey="startTime" domain={[20, 24]} tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={v => `${v}:00`} />
                  <ZAxis range={[30, 30]} />
                  <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
                    formatter={(v) => [`${Number(v).toFixed(1)}:00`, "Start time"]} />
                  <ReferenceLine y={22} stroke="#f59e0b" strokeDasharray="4 2"
                    label={{ value: "Off-peak starts", fill: "#f59e0b", fontSize: 10 }} />
                  <Scatter data={gamingPattern} dataKey="startTime" fill="#f59e0b" opacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Unauthorized charger */}
          {selected.type === "Unauthorized Charger" && (
            <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 space-y-3">
              <div className="text-sm font-semibold text-white">Detection Evidence</div>
              {[
                { label: "Load signature",    value: "11 kW · consistent with 3-phase 16A charger" },
                { label: "Registered EVs",    value: "0 within 200m radius (Vahan cross-check)" },
                { label: "Occurrence pattern",value: "Daily 22:00–02:00 for past 9 days" },
                { label: "Billing anomaly",   value: "No corresponding consumer account found" },
                { label: "Recommended action",value: "Field inspection + meter audit by SDO" },
              ].map(e => (
                <div key={e.label} className="flex gap-3 text-xs rounded-lg p-2.5 bg-[#0f1117] border border-[#2d3748]">
                  <span className="text-[#64748b] shrink-0 w-36">{e.label}</span>
                  <span className="text-[#e2e8f0]">{e.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
