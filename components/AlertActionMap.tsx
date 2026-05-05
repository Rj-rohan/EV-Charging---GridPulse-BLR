"use client";
import { useState } from "react";
import { AlertTriangle, ChevronRight, Play, CheckCircle, X } from "lucide-react";

type AlertAction = {
  alertId: string;
  dtr: string;
  ward: string;
  issue: string;
  severity: "critical" | "warn";
  actions: {
    id: number;
    label: string;
    detail: string;
    impact: string;
    cost: string;
  }[];
};

const alertActions: AlertAction[] = [
  {
    alertId: "ALM-001", dtr: "DTR-114", ward: "Koramangala 5B",
    issue: "Oil Temp High — 88°C (threshold 85°C)",
    severity: "critical",
    actions: [
      { id: 1, label: "Increase tariff by ₹2/kWh",       detail: "Raise peak tariff from ₹7.5 to ₹9.5 for this feeder zone", impact: "−18% load in 30 min", cost: "₹0 (revenue neutral)" },
      { id: 2, label: "Target 120 users via app nudge",   detail: "Send priority nudge to 120 users with departure after 08:30", impact: "−23% load · 64% acceptance", cost: "₹360 incentive" },
      { id: 3, label: "Shift window: 23:00–04:00",        detail: "Propose off-peak window with ₹3.8/kWh rate", impact: "Oil temp below 80°C in 40 min", cost: "₹216 incentive" },
    ],
  },
  {
    alertId: "ALM-002", dtr: "DTR-089", ward: "Sarjapur Rd",
    issue: "Overcurrent — Load at 87%, rising trend",
    severity: "critical",
    actions: [
      { id: 1, label: "Fleet operator API: defer bulk charge", detail: "Contact Ola fleet depot via OCPI API to shift 20:30 charge to 01:00", impact: "−19% load · immediate", cost: "₹0 (API call)" },
      { id: 2, label: "Issue ToU alert to 85 users",      detail: "₹3.8/kWh off-peak incentive for users with departure after 09:00", impact: "−14% load · 68% acceptance", cost: "₹323 incentive" },
    ],
  },
  {
    alertId: "ALM-003", dtr: "DTR-278", ward: "Marathahalli",
    issue: "Oil Temp High — 72°C, approaching threshold",
    severity: "warn",
    actions: [
      { id: 1, label: "Pre-emptive nudge: 40 fleet vehicles", detail: "Shift Ola fleet depot charge from 20:30 to 01:00–05:00", impact: "−14% load · prevents escalation", cost: "₹0 (fleet API)" },
      { id: 2, label: "Raise off-peak incentive to ₹4",   detail: "Increase incentive for this feeder zone only", impact: "−8% additional load", cost: "₹160 incentive" },
    ],
  },
];

const severityColor: Record<string, string> = { critical: "#ef4444", warn: "#f59e0b" };

export default function AlertActionMap() {
  const [selected, setSelected] = useState<AlertAction>(alertActions[0]);
  const [simulated, setSimulated] = useState<Set<number>>(new Set());
  const [simRunning, setSimRunning] = useState<number | null>(null);

  function simulate(id: number) {
    setSimRunning(id);
    setTimeout(() => { setSimRunning(null); setSimulated(prev => new Set([...prev, id])); }, 1200);
  }

  return (
    <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={14} className="text-[#ef4444]" />
        <span className="text-sm font-semibold text-white">Alert → Action Mapping</span>
        <span className="text-xs text-[#64748b] ml-auto">One-click simulate</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Alert list */}
        <div className="space-y-2">
          {alertActions.map(a => (
            <button key={a.alertId} onClick={() => { setSelected(a); setSimulated(new Set()); }}
              className={`w-full text-left rounded-lg p-3 border transition-all ${selected.alertId === a.alertId ? "border-[#6366f1]/50 bg-[#6366f1]/10" : "border-[#2d3748] hover:border-[#64748b]"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: severityColor[a.severity] }} />
                <span className="text-[10px] font-mono text-[#6366f1]">{a.dtr}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold capitalize"
                  style={{ background: `${severityColor[a.severity]}20`, color: severityColor[a.severity] }}>
                  {a.severity}
                </span>
              </div>
              <div className="text-[10px] text-[#e2e8f0]">{a.ward}</div>
              <div className="text-[9px] text-[#64748b] mt-0.5 leading-snug">{a.issue}</div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="col-span-2 space-y-2">
          <div className="text-xs text-[#64748b] mb-2">
            Suggested actions for <span className="text-[#6366f1] font-mono">{selected.dtr}</span> — {selected.ward}
          </div>
          {selected.actions.map(action => {
            const done = simulated.has(action.id);
            const running = simRunning === action.id;
            return (
              <div key={action.id} className={`rounded-xl p-3 border transition-all ${done ? "border-[#10b981]/30 bg-[#10b981]/5" : "border-[#2d3748] bg-[#0f1117]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ChevronRight size={11} className="text-[#6366f1] shrink-0" />
                      <span className="text-xs font-semibold text-white">{action.label}</span>
                    </div>
                    <div className="text-[10px] text-[#64748b] mb-1.5 leading-relaxed">{action.detail}</div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-[#10b981]">Impact: {action.impact}</span>
                      <span className="text-[#64748b]">Cost: {action.cost}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {done ? (
                      <div className="flex items-center gap-1 text-[10px] text-[#10b981] font-semibold">
                        <CheckCircle size={12} /> Simulated
                      </div>
                    ) : (
                      <button onClick={() => simulate(action.id)} disabled={running}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#6366f1] text-white text-[10px] font-semibold hover:bg-[#4f46e5] transition-colors disabled:opacity-50">
                        <Play size={9} />
                        {running ? "Running…" : "Simulate"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
