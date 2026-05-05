"use client";
import { useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Brain, Cpu, AlertTriangle } from "lucide-react";
import AIPanel from "@/components/AIPanel";
import { useGroq } from "@/lib/useGroq";
import { prompts, AIForecastInsight } from "@/lib/groq";

const hours = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0") + ":00";
  const base = 120 + Math.sin((i - 6) * 0.4) * 60 + (i >= 19 && i <= 22 ? 80 : 0);
  return {
    time: h,
    actual: i <= 14 ? +(base + (Math.random() - 0.5) * 15).toFixed(1) : null,
    forecast: +(base + (Math.random() - 0.5) * 10).toFixed(1),
    persistence: +(base * 1.18 + (Math.random() - 0.5) * 20).toFixed(1),
  };
});

const statusColor: Record<string, string> = { critical: "#ef4444", warn: "#f59e0b", ok: "#10b981" };

export default function ForecastingPage() {
  const insights = useGroq<AIForecastInsight[]>([]);

  useEffect(() => { insights.fetch(prompts.forecastInsights()); }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Demand Forecasting</h1>
        <p className="text-[#64748b] text-sm mt-1">Graph WaveNet · Spatio-temporal GNN · 15-min granularity · 24–72h horizon</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Brain,         label: "Model",              value: "Graph WaveNet (GNN)", sub: "DTR nodes · 11kV feeder edges",    color: "#6366f1" },
          { icon: Cpu,           label: "Forecast MAPE (24h)", value: "8.2%",               sub: "vs 23% persistence · 14% LSTM",   color: "#00d4aa" },
          { icon: AlertTriangle, label: "Uncertainty",         value: "MC Dropout",          sub: "Confidence bands on all forecasts", color: "#f59e0b" },
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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <div className="text-sm font-semibold text-white">Feeder Load Forecast — Koramangala DTR-114</div>
            <div className="text-xs text-[#64748b]">Today · kW · Actual vs Forecast vs Persistence baseline</div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#00d4aa] inline-block" />Actual</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#6366f1] inline-block" />GNN Forecast</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#64748b] inline-block" />Persistence</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={hours} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} interval={3} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} labelStyle={{ color: "#e2e8f0" }} />
            <ReferenceLine x="19:00" stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Peak Start", fill: "#f59e0b", fontSize: 10 }} />
            <Line type="monotone" dataKey="actual" stroke="#00d4aa" strokeWidth={2} dot={false} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="5 3" name="GNN Forecast" />
            <Line type="monotone" dataKey="persistence" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Persistence" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI DTR Insights */}
      <AIPanel title="AI Forecast Insights — DTR Risk Analysis" loading={insights.loading}
        error={insights.error} lastFetched={insights.lastFetched}
        onRefresh={() => insights.fetch(prompts.forecastInsights())} color="#6366f1">
        {(insights.data ?? []).length === 0 && !insights.loading ? (
          <p className="text-xs text-[#64748b] text-center py-4">Click refresh to load AI forecast insights</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#64748b] border-b border-[#2d3748]">
                  <th className="text-left pb-2">DTR ID</th>
                  <th className="text-left pb-2">Ward</th>
                  <th className="text-right pb-2">Predicted Peak</th>
                  <th className="text-right pb-2">Peak Time</th>
                  <th className="text-right pb-2">MAPE</th>
                  <th className="text-left pb-2 pl-3">AI Insight</th>
                  <th className="text-right pb-2">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3748]">
                {(insights.data ?? []).map((d, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-mono text-[#00d4aa]">{d.dtr}</td>
                    <td className="py-2.5 text-[#e2e8f0]">{d.ward}</td>
                    <td className="py-2.5 text-right text-[#94a3b8]">{d.predictedPeak} kW</td>
                    <td className="py-2.5 text-right text-[#94a3b8]">{d.peakTime}</td>
                    <td className="py-2.5 text-right text-[#10b981]">{d.mape?.toFixed(1)}%</td>
                    <td className="py-2.5 pl-3 text-[#94a3b8] max-w-xs">{d.insight}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: `${statusColor[d.riskLevel] ?? "#64748b"}20`, color: statusColor[d.riskLevel] ?? "#64748b" }}>
                        {d.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AIPanel>
    </div>
  );
}
