"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Thermometer, Zap, AlertTriangle, CheckCircle,
  Brain, ChevronRight, RefreshCw, Bell, X,
} from "lucide-react";
import AIPanel from "@/components/AIPanel";
import { useGroq } from "@/lib/useGroq";
import { prompts, AIAlarm, AIAction } from "@/lib/groq";

const transformers = [
  { id: "DTR-114", ward: "Koramangala 5B", load: 94, capacity: 400, temp: 88, ev: 47, status: "critical" },
  { id: "DTR-089", ward: "Sarjapur Rd",    load: 87, capacity: 315, temp: 79, ev: 31, status: "critical" },
  { id: "DTR-278", ward: "Marathahalli",   load: 81, capacity: 500, temp: 72, ev: 71, status: "warn" },
  { id: "DTR-203", ward: "HSR Layout S2",  load: 76, capacity: 500, temp: 65, ev: 62, status: "warn" },
  { id: "DTR-341", ward: "Electronic City",load: 61, capacity: 400, temp: 54, ev: 54, status: "ok" },
  { id: "DTR-156", ward: "Whitefield",     load: 58, capacity: 630, temp: 51, ev: 88, status: "ok" },
  { id: "DTR-412", ward: "Indiranagar",    load: 70, capacity: 315, temp: 63, ev: 39, status: "warn" },
  { id: "DTR-509", ward: "Jayanagar",      load: 45, capacity: 400, temp: 44, ev: 22, status: "ok" },
  { id: "DTR-623", ward: "Bannerghatta",   load: 52, capacity: 500, temp: 48, ev: 33, status: "ok" },
  { id: "DTR-731", ward: "Hebbal",         load: 67, capacity: 315, temp: 60, ev: 28, status: "warn" },
  { id: "DTR-845", ward: "Yeshwanthpur",   load: 43, capacity: 400, temp: 41, ev: 19, status: "ok" },
  { id: "DTR-902", ward: "Rajajinagar",    load: 55, capacity: 500, temp: 50, ev: 25, status: "ok" },
];

function buildFeederData(dtrId: string) {
  const offsets: Record<string, number> = { "DTR-114": 30, "DTR-089": 20, "DTR-278": 10, "DTR-203": 5 };
  const off = offsets[dtrId] ?? 0;
  return Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, "0") + ":00";
    const base = 180 + Math.sin((i - 6) * 0.4) * 70 + (i >= 19 && i <= 22 ? 90 + off : 0);
    return {
      time: h,
      forecast: +(base + (Math.random() - 0.5) * 8).toFixed(0),
      actual: i <= 20 ? +(base + (Math.random() - 0.5) * 14).toFixed(0) : null,
    };
  });
}

const heatColor = (load: number) => {
  if (load >= 90) return { bg: "#ef4444", ring: "#ef4444" };
  if (load >= 75) return { bg: "#f59e0b", ring: "#f59e0b" };
  if (load >= 60) return { bg: "#eab308", ring: "#eab308" };
  return { bg: "#10b981", ring: "#10b981" };
};

const severityStyle: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: "#ef444415", color: "#ef4444", border: "#ef444440" },
  warn:     { bg: "#f59e0b15", color: "#f59e0b", border: "#f59e0b40" },
};

export default function OperationsPage() {
  const [selectedDtr, setSelectedDtr] = useState("DTR-114");
  const [ackSet, setAckSet] = useState<Set<string>>(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  const [tick, setTick] = useState(0);

  const alarms = useGroq<AIAlarm[]>([]);
  const actions = useGroq<AIAction[]>([]);

  useEffect(() => {
    alarms.fetch(prompts.liveAlarms());
    actions.fetch(prompts.aiActions(["DTR-114", "DTR-089", "DTR-278"]));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const feederData = buildFeederData(selectedDtr);
  const selectedDtrData = transformers.find(t => t.id === selectedDtr)!;
  const activeAlarms = (alarms.data ?? []).filter(a => !ackSet.has(a.dtr + a.type));
  const criticalCount = activeAlarms.filter(a => a.severity === "critical").length;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">Grid Operations</h1>
            {criticalCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/30 text-xs text-[#ef4444] font-semibold animate-pulse">
                <Bell size={11} />{criticalCount} Critical
              </span>
            )}
          </div>
          <p className="text-[#64748b] text-sm mt-0.5">Real-time SCADA · Live alarms · AI action recommendations</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <RefreshCw size={11} className="text-[#00d4aa]" />
          <span>Updated <span className="text-[#00d4aa]">{tick * 5}s ago</span></span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Critical Alarms",    value: String(criticalCount || "—"),                                    color: "#ef4444", icon: AlertTriangle },
          { label: "DTRs > 80% Load",    value: String(transformers.filter(t => t.load >= 80).length),          color: "#f59e0b", icon: Zap },
          { label: "Oil Temp Alerts",    value: String((alarms.data ?? []).filter(a => a.type === "Oil Temp High").length || "—"), color: "#f97316", icon: Thermometer },
          { label: "AI Actions Pending", value: String((actions.data ?? []).filter((_, i) => !appliedSuggestions.has(i) && !dismissedSuggestions.has(i)).length || "—"), color: "#6366f1", icon: Brain },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#64748b]">{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <div className="text-3xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Heatmap */}
        <div className="lg:col-span-3 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Transformer Heatmap</div>
            <div className="flex items-center gap-3 text-[10px] text-[#64748b]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#ef4444] inline-block" />≥90%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#f59e0b] inline-block" />75–89%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#eab308] inline-block" />60–74%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#10b981] inline-block" />&lt;60%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {transformers.map(t => {
              const c = heatColor(t.load);
              const isSelected = selectedDtr === t.id;
              return (
                <button key={t.id} onClick={() => setSelectedDtr(t.id)}
                  className="relative rounded-xl p-3 text-left transition-all hover:scale-105"
                  style={{ background: `${c.bg}22`, border: `1.5px solid ${isSelected ? c.ring : c.bg + "55"}`, boxShadow: isSelected ? `0 0 0 2px ${c.ring}55` : "none" }}>
                  {t.load >= 90 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />}
                  <div className="text-[10px] font-mono font-bold" style={{ color: c.bg }}>{t.id}</div>
                  <div className="text-[9px] text-[#64748b] truncate mt-0.5">{t.ward}</div>
                  <div className="mt-2 text-lg font-bold" style={{ color: c.bg }}>{t.load}%</div>
                  <div className="text-[9px] text-[#64748b]">{t.capacity} kVA</div>
                  <div className="mt-1.5 h-1 bg-[#2d3748] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${t.load}%`, background: c.bg }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Alarms — AI powered */}
        <div className="lg:col-span-2">
          <AIPanel title="Live SCADA Alarms" loading={alarms.loading} error={alarms.error}
            lastFetched={alarms.lastFetched} onRefresh={() => alarms.fetch(prompts.liveAlarms())} color="#ef4444">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(alarms.data ?? []).length === 0 && !alarms.loading && (
                <p className="text-xs text-[#64748b] text-center py-4">Click refresh to load live alarms</p>
              )}
              {(alarms.data ?? []).map((alarm, idx) => {
                const key = alarm.dtr + alarm.type;
                const acked = ackSet.has(key);
                const s = severityStyle[alarm.severity] ?? severityStyle.warn;
                return (
                  <div key={idx} className="rounded-lg p-3 transition-all"
                    style={{ background: acked ? "#0f111780" : s.bg, border: `1px solid ${acked ? "#2d3748" : s.border}`, opacity: acked ? 0.5 : 1 }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {alarm.severity === "critical"
                          ? <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: s.color }} />
                          : <Zap size={13} className="mt-0.5 shrink-0" style={{ color: s.color }} />}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{alarm.type}</span>
                            <span className="text-[10px] font-mono" style={{ color: s.color }}>{alarm.dtr}</span>
                          </div>
                          <div className="text-[10px] text-[#94a3b8] mt-0.5">{alarm.detail}</div>
                          <div className="text-[10px] text-[#64748b] mt-0.5">{alarm.time}</div>
                        </div>
                      </div>
                      {!acked
                        ? <button onClick={() => setAckSet(prev => new Set([...prev, key]))}
                            className="shrink-0 text-[10px] px-2 py-0.5 rounded border border-[#2d3748] text-[#64748b] hover:text-white transition-colors">ACK</button>
                        : <CheckCircle size={12} className="text-[#10b981] shrink-0 mt-0.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </AIPanel>
        </div>
      </div>

      {/* Feeder Load Curve */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div>
            <div className="text-sm font-semibold text-white">
              Feeder Load Curve — {selectedDtr}
              <span className="ml-2 text-xs text-[#64748b] font-normal">{selectedDtrData.ward}</span>
            </div>
            <div className="text-xs text-[#64748b] mt-0.5">Real-time vs AI Forecast · kW · 24h</div>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#00d4aa] inline-block" />Real-time</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#6366f1] inline-block" />Forecast</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={feederData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} interval={3} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} labelStyle={{ color: "#e2e8f0" }} />
            <ReferenceLine y={selectedDtrData.capacity * 0.9} stroke="#ef4444" strokeDasharray="4 2"
              label={{ value: "90% Limit", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }} />
            <ReferenceLine x="20:00" stroke="#f59e0b" strokeDasharray="3 2"
              label={{ value: "Now", fill: "#f59e0b", fontSize: 10 }} />
            <Line type="monotone" dataKey="actual" stroke="#00d4aa" strokeWidth={2.5} dot={false} name="Real-time" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Action Recommendations */}
      <AIPanel title="AI Action Recommendations — What should you do RIGHT NOW?"
        loading={actions.loading} error={actions.error} lastFetched={actions.lastFetched}
        onRefresh={() => actions.fetch(prompts.aiActions(["DTR-114", "DTR-089", "DTR-278"]))} color="#6366f1">
        <div className="space-y-3">
          {(actions.data ?? []).length === 0 && !actions.loading && (
            <p className="text-xs text-[#64748b] text-center py-4">Click refresh to load AI recommendations</p>
          )}
          {(actions.data ?? []).map((s, idx) => {
            const applied = appliedSuggestions.has(idx);
            const dismissed = dismissedSuggestions.has(idx);
            if (dismissed) return null;
            const urgColor = s.urgency === "critical" ? "#ef4444" : "#f59e0b";
            return (
              <div key={idx} className="rounded-xl p-4 transition-all"
                style={{ background: applied ? "#10b98110" : `${urgColor}0d`, border: `1px solid ${applied ? "#10b98140" : urgColor + "35"}` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${urgColor}20`, color: urgColor }}>{s.urgency?.toUpperCase()}</span>
                      <span className="text-[10px] font-mono text-[#64748b]">{s.dtr}</span>
                      <span className="text-[10px] text-[#64748b]">Confidence: <span className="text-[#00d4aa]">{s.confidence}%</span></span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{s.action}</div>
                    <div className="text-xs text-[#94a3b8] leading-relaxed mb-2">{s.detail}</div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <ChevronRight size={11} className="text-[#10b981]" />
                      <span className="text-[#10b981] font-medium">{s.impact}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {applied ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981]/20 text-[#10b981] text-xs font-medium">
                        <CheckCircle size={12} />Applied
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setAppliedSuggestions(prev => new Set([...prev, idx]))}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                          style={{ background: urgColor }}>Apply Now</button>
                        <button onClick={() => setDismissedSuggestions(prev => new Set([...prev, idx]))}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#64748b] border border-[#2d3748] flex items-center gap-1 justify-center">
                          <X size={11} />Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AIPanel>
    </div>
  );
}
