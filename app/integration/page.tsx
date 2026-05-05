"use client";
import { useState, useEffect } from "react";
import { Plug, CheckCircle, AlertTriangle, XCircle, RefreshCw, Database } from "lucide-react";

const systems = [
  { name: "SCADA Historian",    id: "SCADA-01", status: "connected",    latency: 4.2,  lastData: "18s ago",  missing: 1.2, mode: "AI" },
  { name: "GIS (ESRI ArcGIS)", id: "GIS-01",   status: "connected",    latency: 12.1, lastData: "1m ago",   missing: 0.0, mode: "AI" },
  { name: "Billing System",     id: "BILL-01",  status: "connected",    latency: 8.7,  lastData: "5m ago",   missing: 0.0, mode: "AI" },
  { name: "Vahan EV Registry",  id: "VAHAN-01", status: "degraded",     latency: 340,  lastData: "18m ago",  missing: 8.4, mode: "Rule" },
  { name: "OCPI Charger DB",    id: "OCPI-01",  status: "connected",    latency: 22.4, lastData: "3m ago",   missing: 0.0, mode: "AI" },
  { name: "BESCOM Consumer App",id: "APP-01",   status: "connected",    latency: 6.1,  lastData: "2s ago",   missing: 0.0, mode: "AI" },
  { name: "Weather API",        id: "WX-01",    status: "disconnected", latency: 0,    lastData: "2h ago",   missing: 100, mode: "Rule" },
];

const dtrMissing = [
  { dtr: "DTR-114", ward: "Koramangala", missing: 0.8, gaps: 2 },
  { dtr: "DTR-089", ward: "Sarjapur",    missing: 2.1, gaps: 5 },
  { dtr: "DTR-278", ward: "Marathahalli",missing: 0.0, gaps: 0 },
  { dtr: "DTR-203", ward: "HSR Layout",  missing: 4.7, gaps: 11 },
  { dtr: "DTR-341", ward: "E-City",      missing: 0.0, gaps: 0 },
  { dtr: "DTR-156", ward: "Whitefield",  missing: 1.2, gaps: 3 },
];

const statusIcon = (s: string) => {
  if (s === "connected")    return <CheckCircle size={13} className="text-[#10b981]" />;
  if (s === "degraded")     return <AlertTriangle size={13} className="text-[#f59e0b]" />;
  return <XCircle size={13} className="text-[#ef4444]" />;
};
const statusColor: Record<string, string> = {
  connected: "#10b981", degraded: "#f59e0b", disconnected: "#ef4444"
};

export default function IntegrationPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const connected = systems.filter(s => s.status === "connected").length;
  const degraded  = systems.filter(s => s.status === "degraded").length;
  const down      = systems.filter(s => s.status === "disconnected").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">SCADA & Integration Status</h1>
          <p className="text-[#64748b] text-sm mt-1">Read-only connectors · Data latency · Fallback mode · Missing data handling</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <RefreshCw size={11} className="text-[#00d4aa]" />
          <span>Polled <span className="text-[#00d4aa]">{tick * 4}s ago</span></span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Connected",     value: connected, color: "#10b981" },
          { label: "Degraded",      value: degraded,  color: "#f59e0b" },
          { label: "Disconnected",  value: down,      color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 flex items-center gap-4">
            <div className="text-4xl font-bold" style={{ color }}>{value}</div>
            <div>
              <div className="text-sm text-white">{label}</div>
              <div className="text-xs text-[#64748b]">systems</div>
            </div>
          </div>
        ))}
      </div>

      {/* System table */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-2 mb-4">
          <Plug size={14} className="text-[#00d4aa]" />
          <span className="text-sm font-semibold text-white">Integration Endpoints</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[#64748b] border-b border-[#2d3748]">
              <th className="text-left pb-2">System</th>
              <th className="text-left pb-2">ID</th>
              <th className="text-center pb-2">Status</th>
              <th className="text-right pb-2">Latency</th>
              <th className="text-right pb-2">Last Data</th>
              <th className="text-right pb-2">Missing %</th>
              <th className="text-center pb-2">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d3748]">
            {systems.map(s => (
              <tr key={s.id}>
                <td className="py-2.5 text-[#e2e8f0] font-medium">{s.name}</td>
                <td className="py-2.5 font-mono text-[#64748b]">{s.id}</td>
                <td className="py-2.5">
                  <div className="flex items-center justify-center gap-1.5">
                    {statusIcon(s.status)}
                    <span className="capitalize" style={{ color: statusColor[s.status] }}>{s.status}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  {s.status === "disconnected" ? (
                    <span className="text-[#64748b]">—</span>
                  ) : (
                    <span style={{ color: s.latency > 100 ? "#f59e0b" : "#10b981" }}>{s.latency} ms</span>
                  )}
                </td>
                <td className="py-2.5 text-right text-[#94a3b8]">{s.lastData}</td>
                <td className="py-2.5 text-right">
                  <span style={{ color: s.missing > 5 ? "#ef4444" : s.missing > 0 ? "#f59e0b" : "#10b981" }}>
                    {s.missing.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.mode === "AI" ? "bg-[#6366f1]/20 text-[#6366f1]" : "bg-[#f59e0b]/20 text-[#f59e0b]"}`}>
                    {s.mode === "AI" ? "AI Model" : "Rule-based"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DTR missing data */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Database size={14} className="text-[#f59e0b]" />
            <span className="text-sm font-semibold text-white">Missing Data % per DTR</span>
          </div>
          <div className="space-y-2.5">
            {dtrMissing.map(d => (
              <div key={d.dtr}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-mono text-[#6366f1]">{d.dtr}</span>
                  <span className="text-[#64748b]">{d.ward}</span>
                  <span style={{ color: d.missing > 3 ? "#ef4444" : d.missing > 0 ? "#f59e0b" : "#10b981" }}>
                    {d.missing.toFixed(1)}% · {d.gaps} gaps
                  </span>
                </div>
                <div className="h-1.5 bg-[#2d3748] rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${Math.min(d.missing * 10, 100)}%`, background: d.missing > 3 ? "#ef4444" : d.missing > 0 ? "#f59e0b" : "#10b981" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fallback mode explanation */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-4">Fallback Mode Logic</div>
          <div className="space-y-3">
            {[
              { condition: "SCADA data gap < 15 min", action: "Graph model propagates from neighboring DTR nodes. MC Dropout uncertainty flagged.", mode: "AI", color: "#6366f1" },
              { condition: "SCADA data gap 15–60 min", action: "Switch to rule-based: 90% capacity hard limit enforced. Planner notified.", mode: "Rule", color: "#f59e0b" },
              { condition: "SCADA fully disconnected", action: "Freeze last known state. All scheduling nudges paused. Manual override required.", mode: "Manual", color: "#ef4444" },
              { condition: "Vahan data stale > 24h", action: "Use last known EV density. Bass diffusion model extrapolates forward.", mode: "AI", color: "#6366f1" },
            ].map((f, i) => (
              <div key={i} className="rounded-lg p-3 bg-[#0f1117] border border-[#2d3748]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-white mb-0.5">{f.condition}</div>
                    <div className="text-[10px] text-[#64748b] leading-relaxed">{f.action}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0"
                    style={{ background: `${f.color}20`, color: f.color }}>{f.mode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
