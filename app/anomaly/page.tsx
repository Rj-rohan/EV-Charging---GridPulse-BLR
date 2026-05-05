"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { ScanSearch, AlertTriangle, Zap, UserX, TrendingUp } from "lucide-react";
import AIPanel from "@/components/AIPanel";
import { useGroq } from "@/lib/useGroq";
import { prompts, AIAnomalySummary } from "@/lib/groq";

const loadSpike = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0") + ":00";
  const base = 200 + Math.sin((i - 6) * 0.4) * 60;
  return { time: h, load: +(i === 20 ? base + 85 : base).toFixed(0), upper: +(base + 30).toFixed(0), lower: +(base - 30).toFixed(0) };
});

const gamingPattern = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  startTime: 22 + (Math.random() < 0.85 ? 0 : (Math.random() - 0.5) * 2),
}));

const severityColor: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#64748b" };
const statusStyle: Record<string, { bg: string; color: string }> = {
  open:          { bg: "#ef444420", color: "#ef4444" },
  investigating: { bg: "#f59e0b20", color: "#f59e0b" },
  resolved:      { bg: "#10b98120", color: "#10b981" },
};

export default function AnomalyPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filter, setFilter] = useState<"all" | "open" | "investigating">("all");
  const anomalies = useGroq<AIAnomalySummary[]>([]);

  useEffect(() => { anomalies.fetch(prompts.anomalies()); }, []);

  const data = anomalies.data ?? [];
  const filtered = data.filter(a => filter === "all" || a.status === filter);
  const selected = filtered[selectedIdx] ?? data[0];
  const openCount = data.filter(a => a.status === "open").length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Anomaly & Fraud Detection</h1>
        <p className="text-[#64748b] text-sm mt-1">Tariff gaming · Unauthorized chargers · Abnormal load spikes · AI-powered detection</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Anomalies",        value: openCount || "—",                                                    color: "#ef4444", icon: AlertTriangle },
          { label: "Tariff Gaming Cases",   value: data.filter(a => a.type === "Tariff Gaming").length || "—",          color: "#f59e0b", icon: UserX },
          { label: "Unauthorized Chargers", value: data.filter(a => a.type === "Unauthorized Charger").length || "—",   color: "#6366f1", icon: Zap },
          { label: "Load Spikes (7d)",      value: data.filter(a => a.type === "Abnormal Load Spike").length || "—",    color: "#ec4899", icon: TrendingUp },
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

      {/* AI Anomaly Detection */}
      <AIPanel title="AI Anomaly Detection" loading={anomalies.loading} error={anomalies.error}
        lastFetched={anomalies.lastFetched} onRefresh={() => anomalies.fetch(prompts.anomalies())} color="#ef4444">
        {data.length === 0 && !anomalies.loading ? (
          <p className="text-xs text-[#64748b] text-center py-4">Click refresh to run AI anomaly detection</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* List */}
            <div>
              <div className="flex gap-1 mb-3">
                {(["all", "open", "investigating"] as const).map(f => (
                  <button key={f} onClick={() => { setFilter(f); setSelectedIdx(0); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] capitalize transition-all ${filter === f ? "bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/40" : "text-[#64748b] border border-[#2d3748]"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filtered.map((a, i) => (
                  <button key={a.id} onClick={() => setSelectedIdx(i)}
                    className={`w-full text-left rounded-lg p-3 border transition-all ${selectedIdx === i ? "border-[#6366f1]/50 bg-[#6366f1]/10" : "border-[#2d3748] hover:border-[#64748b]"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold" style={{ color: severityColor[a.severity] }}>{a.type}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full capitalize"
                        style={{ background: statusStyle[a.status]?.bg, color: statusStyle[a.status]?.color }}>
                        {a.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#64748b]">{a.ward}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail + chart */}
            <div className="lg:col-span-2 space-y-3">
              {selected && (
                <>
                  <div className="bg-[#0f1117] border border-[#2d3748] rounded-xl p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{selected.type}</span>
                          <span className="text-[10px] font-mono text-[#6366f1]">{selected.id}</span>
                        </div>
                        <div className="text-xs text-[#64748b]">{selected.ward} · {selected.user}</div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] px-2 py-1 rounded-full font-bold capitalize"
                          style={{ background: `${severityColor[selected.severity]}20`, color: severityColor[selected.severity] }}>
                          {selected.severity}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-[#94a3b8] leading-relaxed">{selected.detail}</div>
                  </div>

                  {selected.type === "Abnormal Load Spike" && (
                    <div className="bg-[#0f1117] border border-[#2d3748] rounded-xl p-3">
                      <div className="text-xs font-semibold text-white mb-2">Load vs 3σ Bounds</div>
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={loadSpike} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                          <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} interval={3} />
                          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
                          <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
                          <ReferenceLine x="20:00" stroke="#ef4444" strokeDasharray="4 2" label={{ value: "Spike", fill: "#ef4444", fontSize: 10 }} />
                          <Line type="monotone" dataKey="upper" stroke="#2d3748" strokeWidth={1} dot={false} name="Upper 3σ" />
                          <Line type="monotone" dataKey="lower" stroke="#2d3748" strokeWidth={1} dot={false} name="Lower 3σ" />
                          <Line type="monotone" dataKey="load" stroke="#00d4aa" strokeWidth={2} dot={false} name="Load" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {selected.type === "Tariff Gaming" && (
                    <div className="bg-[#0f1117] border border-[#2d3748] rounded-xl p-3">
                      <div className="text-xs font-semibold text-white mb-2">Charging Start Time Pattern</div>
                      <ResponsiveContainer width="100%" height={160}>
                        <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                          <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 9 }} interval={4} />
                          <YAxis dataKey="startTime" domain={[20, 24]} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={v => `${v}:00`} />
                          <ZAxis range={[30, 30]} />
                          <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
                            formatter={(v) => [`${Number(v).toFixed(1)}:00`, "Start time"]} />
                          <ReferenceLine y={22} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Off-peak starts", fill: "#f59e0b", fontSize: 10 }} />
                          <Scatter data={gamingPattern} dataKey="startTime" fill="#f59e0b" opacity={0.8} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </AIPanel>
    </div>
  );
}
