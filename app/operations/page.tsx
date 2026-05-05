"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import {
  Thermometer, Zap, AlertTriangle, CheckCircle,
  Brain, ChevronRight, RefreshCw, Bell, X,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

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

const alarms = [
  { id: "ALM-001", dtr: "DTR-114", type: "Oil Temp High",   detail: "88°C — threshold 85°C",          severity: "critical", time: "2 min ago",  ack: false },
  { id: "ALM-002", dtr: "DTR-089", type: "Overcurrent",     detail: "Load at 87% — rising trend",      severity: "critical", time: "4 min ago",  ack: false },
  { id: "ALM-003", dtr: "DTR-278", type: "Oil Temp High",   detail: "72°C — approaching threshold",    severity: "warn",     time: "9 min ago",  ack: false },
  { id: "ALM-004", dtr: "DTR-203", type: "EV Surge Detect", detail: "+18 chargers online since 19:00", severity: "warn",     time: "12 min ago", ack: false },
  { id: "ALM-005", dtr: "DTR-412", type: "Overcurrent",     detail: "Load at 70% — EV cluster active", severity: "warn",     time: "18 min ago", ack: true  },
  { id: "ALM-006", dtr: "DTR-731", type: "Voltage Sag",     detail: "0.94 pu — below 0.95 pu limit",   severity: "warn",     time: "25 min ago", ack: true  },
];

const aiSuggestions = [
  {
    id: 1,
    dtr: "DTR-114",
    action: "Shift 120 users from DTR-114 to off-peak window",
    detail: "Koramangala 5B feeder at 94% load. Nudging 120 EV users to 23:00–06:00 window reduces load to ~71% and brings oil temp below 80°C within 40 min.",
    impact: "−23% load · −8°C oil temp · 0 outages",
    confidence: 94,
    urgency: "critical",
  },
  {
    id: 2,
    dtr: "DTR-089",
    action: "Issue ToU incentive alert to 85 Sarjapur users",
    detail: "DTR-089 overcurrent trend. Offering ₹3.8/kWh off-peak rate to 85 users with departure after 08:00 can flatten the 20:00–21:30 spike.",
    impact: "−19% peak · ₹4.2 avg saving/user",
    confidence: 88,
    urgency: "critical",
  },
  {
    id: 3,
    dtr: "DTR-278",
    action: "Pre-emptive nudge: 40 Marathahalli fleet vehicles",
    detail: "Ola fleet depot on Marathahalli feeder scheduled for 20:30 bulk charge. Recommend shifting to 01:00–05:00 slot. Fleet operator API available.",
    impact: "−14% load · prevents warn→critical escalation",
    confidence: 81,
    urgency: "warn",
  },
];

// ─── Feeder load curve data ───────────────────────────────────────────────────

function buildFeederData(dtrId: string) {
  const offsets: Record<string, number> = {
    "DTR-114": 30, "DTR-089": 20, "DTR-278": 10, "DTR-203": 5,
  };
  const off = offsets[dtrId] ?? 0;
  return Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, "0") + ":00";
    const base = 180 + Math.sin((i - 6) * 0.4) * 70 + (i >= 19 && i <= 22 ? 90 + off : 0);
    const forecast = +(base + (Math.random() - 0.5) * 8).toFixed(0);
    const actual = i <= 20 ? +(base + (Math.random() - 0.5) * 14).toFixed(0) : null;
    return { time: h, forecast, actual };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const heatColor = (load: number) => {
  if (load >= 90) return { bg: "#ef4444", text: "#fff", ring: "#ef4444" };
  if (load >= 75) return { bg: "#f59e0b", text: "#fff", ring: "#f59e0b" };
  if (load >= 60) return { bg: "#eab308", text: "#fff", ring: "#eab308" };
  return { bg: "#10b981", text: "#fff", ring: "#10b981" };
};

const severityStyle: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: "#ef444415", color: "#ef4444", border: "#ef444440" },
  warn:     { bg: "#f59e0b15", color: "#f59e0b", border: "#f59e0b40" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function OperationsPage() {
  const [selectedDtr, setSelectedDtr] = useState("DTR-114");
  const [ackSet, setAckSet] = useState<Set<string>>(new Set(alarms.filter((a) => a.ack).map((a) => a.id)));
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  const [tick, setTick] = useState(0);

  // Simulate live clock tick
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const feederData = buildFeederData(selectedDtr);
  const activeAlarms = alarms.filter((a) => !ackSet.has(a.id));
  const criticalCount = activeAlarms.filter((a) => a.severity === "critical").length;
  const selectedDtrData = transformers.find((t) => t.id === selectedDtr)!;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">Grid Operations</h1>
            {criticalCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/30 text-xs text-[#ef4444] font-semibold animate-pulse">
                <Bell size={11} />
                {criticalCount} Critical
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

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Critical Alarms",    value: String(criticalCount),                          color: "#ef4444", icon: AlertTriangle },
          { label: "DTRs > 80% Load",    value: String(transformers.filter((t) => t.load >= 80).length), color: "#f59e0b", icon: Zap },
          { label: "Oil Temp Alerts",    value: "2",                                            color: "#f97316", icon: Thermometer },
          { label: "AI Actions Pending", value: String(aiSuggestions.filter((s) => !appliedSuggestions.has(s.id) && !dismissedSuggestions.has(s.id)).length), color: "#6366f1", icon: Brain },
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

      <div className="grid grid-cols-5 gap-4">
        {/* ── Transformer Heatmap ── */}
        <div className="col-span-3 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Transformer Heatmap</div>
            <div className="flex items-center gap-3 text-[10px] text-[#64748b]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#ef4444] inline-block" />≥90%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#f59e0b] inline-block" />75–89%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#eab308] inline-block" />60–74%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#10b981] inline-block" />&lt;60%</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {transformers.map((t) => {
              const c = heatColor(t.load);
              const isSelected = selectedDtr === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedDtr(t.id)}
                  className="relative rounded-xl p-3 text-left transition-all hover:scale-105"
                  style={{
                    background: `${c.bg}22`,
                    border: `1.5px solid ${isSelected ? c.ring : c.bg + "55"}`,
                    boxShadow: isSelected ? `0 0 0 2px ${c.ring}55` : "none",
                  }}
                >
                  {t.load >= 90 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
                  )}
                  <div className="text-[10px] font-mono font-bold" style={{ color: c.bg }}>{t.id}</div>
                  <div className="text-[9px] text-[#64748b] truncate mt-0.5">{t.ward}</div>
                  <div className="mt-2 text-lg font-bold" style={{ color: c.bg }}>{t.load}%</div>
                  <div className="text-[9px] text-[#64748b]">{t.capacity} kVA</div>
                  {/* mini load bar */}
                  <div className="mt-1.5 h-1 bg-[#2d3748] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${t.load}%`, background: c.bg }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active Alarms ── */}
        <div className="col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Active Alarms</div>
            <span className="text-xs text-[#64748b]">{activeAlarms.length} unacknowledged</span>
          </div>
          <div className="flex-1 space-y-2 overflow-auto">
            {alarms.map((alarm) => {
              const acked = ackSet.has(alarm.id);
              const s = severityStyle[alarm.severity];
              return (
                <div
                  key={alarm.id}
                  className="rounded-lg p-3 transition-all"
                  style={{
                    background: acked ? "#0f111780" : s.bg,
                    border: `1px solid ${acked ? "#2d3748" : s.border}`,
                    opacity: acked ? 0.5 : 1,
                  }}
                >
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
                    {!acked && (
                      <button
                        onClick={() => setAckSet((prev) => new Set([...prev, alarm.id]))}
                        className="shrink-0 text-[10px] px-2 py-0.5 rounded border border-[#2d3748] text-[#64748b] hover:text-white hover:border-[#64748b] transition-colors"
                      >
                        ACK
                      </button>
                    )}
                    {acked && <CheckCircle size={12} className="text-[#10b981] shrink-0 mt-0.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Feeder Load Curve ── */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-sm font-semibold text-white">
              Feeder Load Curve — {selectedDtr}
              <span className="ml-2 text-xs text-[#64748b] font-normal">{selectedDtrData.ward}</span>
            </div>
            <div className="text-xs text-[#64748b] mt-0.5">Real-time vs AI Forecast · kW · 24h</div>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#00d4aa] inline-block" />Real-time</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#6366f1] inline-block" style={{ borderTop: "2px dashed #6366f1", background: "none" }} />Forecast</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={feederData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} interval={3} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
            <Tooltip
              contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <ReferenceLine
              y={selectedDtrData.capacity * 0.9}
              stroke="#ef4444"
              strokeDasharray="4 2"
              label={{ value: "90% Limit", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }}
            />
            <ReferenceLine
              x="20:00"
              stroke="#f59e0b"
              strokeDasharray="3 2"
              label={{ value: "Now", fill: "#f59e0b", fontSize: 10 }}
            />
            <Line type="monotone" dataKey="actual"   stroke="#00d4aa" strokeWidth={2.5} dot={false} name="Real-time" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── AI Suggestions ── */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1]/20 flex items-center justify-center">
            <Brain size={14} className="text-[#6366f1]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Action Recommendations</div>
            <div className="text-xs text-[#64748b]">What should you do RIGHT NOW?</div>
          </div>
        </div>

        <div className="space-y-3">
          {aiSuggestions.map((s) => {
            const applied = appliedSuggestions.has(s.id);
            const dismissed = dismissedSuggestions.has(s.id);
            if (dismissed) return null;
            const urgColor = s.urgency === "critical" ? "#ef4444" : "#f59e0b";
            return (
              <div
                key={s.id}
                className="rounded-xl p-4 transition-all"
                style={{
                  background: applied ? "#10b98110" : `${urgColor}0d`,
                  border: `1px solid ${applied ? "#10b98140" : urgColor + "35"}`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${urgColor}20`, color: urgColor }}
                      >
                        {s.urgency.toUpperCase()}
                      </span>
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
                        <CheckCircle size={12} />
                        Applied
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setAppliedSuggestions((prev) => new Set([...prev, s.id]))}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors hover:opacity-90"
                          style={{ background: urgColor }}
                        >
                          Apply Now
                        </button>
                        <button
                          onClick={() => setDismissedSuggestions((prev) => new Set([...prev, s.id]))}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#64748b] border border-[#2d3748] hover:border-[#64748b] transition-colors flex items-center gap-1 justify-center"
                        >
                          <X size={11} />
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {aiSuggestions.every((s) => dismissedSuggestions.has(s.id) || appliedSuggestions.has(s.id)) && (
            <div className="text-center py-6 text-sm text-[#64748b]">
              <CheckCircle size={20} className="text-[#10b981] mx-auto mb-2" />
              All recommendations actioned. Grid is stable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
