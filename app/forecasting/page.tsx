"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { Brain, Cpu, AlertTriangle } from "lucide-react";

const hours = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0") + ":00";
  const base = 120 + Math.sin((i - 6) * 0.4) * 60 + (i >= 19 && i <= 22 ? 80 : 0);
  const actual = i <= 14 ? +(base + (Math.random() - 0.5) * 15).toFixed(1) : null;
  const forecast = +(base + (Math.random() - 0.5) * 10).toFixed(1);
  const persistence = +(base * 1.18 + (Math.random() - 0.5) * 20).toFixed(1);
  return { time: h, actual, forecast, persistence };
});

const dtrs = [
  { id: "DTR-114", ward: "Koramangala", load: 91, capacity: 400, ev: 47, mape: 7.8, status: "critical" },
  { id: "DTR-089", ward: "Sarjapur", load: 84, capacity: 315, ev: 31, mape: 8.1, status: "warn" },
  { id: "DTR-203", ward: "HSR Layout", load: 76, capacity: 500, ev: 62, mape: 9.2, status: "ok" },
  { id: "DTR-156", ward: "Whitefield", load: 68, capacity: 630, ev: 88, mape: 7.4, status: "ok" },
  { id: "DTR-341", ward: "Electronic City", load: 55, capacity: 400, ev: 54, mape: 8.9, status: "ok" },
  { id: "DTR-278", ward: "Marathahalli", load: 79, capacity: 500, ev: 71, mape: 8.6, status: "warn" },
];

const statusColor: Record<string, string> = {
  critical: "#ef4444", warn: "#f59e0b", ok: "#10b981"
};

export default function ForecastingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Demand Forecasting</h1>
        <p className="text-[#64748b] text-sm mt-1">
          Graph WaveNet · Spatio-temporal GNN · 15-min granularity · 24–72h horizon
        </p>
      </div>

      {/* Model info */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Brain, label: "Model", value: "Graph WaveNet (GNN)", sub: "DTR nodes · 11kV feeder edges", color: "#6366f1" },
          { icon: Cpu, label: "Forecast MAPE (24h)", value: "8.2%", sub: "vs 23% persistence · 14% LSTM", color: "#00d4aa" },
          { icon: AlertTriangle, label: "Uncertainty", value: "MC Dropout", sub: "Confidence bands on all forecasts", color: "#f59e0b" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 flex gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-xs text-[#64748b]">{label}</div>
              <div className="font-bold text-white text-sm">{value}</div>
              <div className="text-xs text-[#64748b]">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-white">Feeder Load Forecast — Koramangala DTR-114</div>
            <div className="text-xs text-[#64748b]">Today · kW · Actual vs Forecast vs Persistence baseline</div>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#00d4aa] inline-block" />Actual</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#6366f1] inline-block" />GNN Forecast</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#64748b] inline-block border-dashed" />Persistence</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={hours} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} interval={3} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
            <Tooltip
              contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <ReferenceLine x="19:00" stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Peak Start", fill: "#f59e0b", fontSize: 10 }} />
            <Line type="monotone" dataKey="actual" stroke="#00d4aa" strokeWidth={2} dot={false} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="5 3" name="GNN Forecast" />
            <Line type="monotone" dataKey="persistence" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Persistence" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* DTR Table */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-4">Distribution Transformer Status</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-[#64748b] border-b border-[#2d3748]">
              <th className="text-left pb-2">DTR ID</th>
              <th className="text-left pb-2">Ward</th>
              <th className="text-right pb-2">Load %</th>
              <th className="text-right pb-2">Capacity (kVA)</th>
              <th className="text-right pb-2">EV Registrations</th>
              <th className="text-right pb-2">MAPE</th>
              <th className="text-right pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d3748]">
            {dtrs.map((d) => (
              <tr key={d.id} className="text-xs">
                <td className="py-2.5 font-mono text-[#00d4aa]">{d.id}</td>
                <td className="py-2.5 text-[#e2e8f0]">{d.ward}</td>
                <td className="py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-[#2d3748] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${d.load}%`, background: statusColor[d.status] }}
                      />
                    </div>
                    <span style={{ color: statusColor[d.status] }}>{d.load}%</span>
                  </div>
                </td>
                <td className="py-2.5 text-right text-[#94a3b8]">{d.capacity}</td>
                <td className="py-2.5 text-right text-[#94a3b8]">{d.ev}</td>
                <td className="py-2.5 text-right text-[#10b981]">{d.mape}%</td>
                <td className="py-2.5 text-right">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: `${statusColor[d.status]}20`, color: statusColor[d.status] }}
                  >
                    {d.status === "critical" ? "Critical" : d.status === "warn" ? "Warning" : "Normal"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
