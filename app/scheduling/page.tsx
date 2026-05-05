"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { CheckCircle, Clock, Users, Zap, Star } from "lucide-react";
import AIPanel from "@/components/AIPanel";
import { useGroq } from "@/lib/useGroq";
import { prompts, AIScheduleNudge } from "@/lib/groq";

const peakData = [
  { time: "18:00", before: 310, after: 310 },
  { time: "18:30", before: 340, after: 325 },
  { time: "19:00", before: 390, after: 340 },
  { time: "19:30", before: 430, after: 355 },
  { time: "20:00", before: 460, after: 362 },
  { time: "20:30", before: 445, after: 358 },
  { time: "21:00", before: 410, after: 345 },
  { time: "21:30", before: 370, after: 330 },
  { time: "22:00", before: 320, after: 310 },
];

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  accepted: { bg: "#10b98120", color: "#10b981", label: "Accepted" },
  modified:  { bg: "#f59e0b20", color: "#f59e0b", label: "Modified" },
  ignored:   { bg: "#ef444420", color: "#ef4444", label: "Ignored" },
};

export default function SchedulingPage() {
  const [fairness, setFairness] = useState(70);
  const [incentive, setIncentive] = useState(50);
  const nudges = useGroq<AIScheduleNudge[]>([]);

  useEffect(() => { nudges.fetch(prompts.scheduleNudges()); }, []);

  const data = nudges.data ?? [];
  const accepted = Math.round(data.length * 0.64);
  const avgDelay = 28;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Charging Scheduler</h1>
        <p className="text-[#64748b] text-sm mt-1">Contextual Bandit · Constraint Satisfaction · Nudge-based · Fairness-aware</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users,        label: "Users Nudged Tonight", value: data.length || "—",  color: "#6366f1" },
          { icon: CheckCircle,  label: "Acceptance Rate",      value: data.length ? "64%" : "—", color: "#10b981" },
          { icon: Clock,        label: "Avg Delay (mins)",     value: data.length ? `${avgDelay} min` : "—", color: "#f59e0b" },
          { icon: Zap,          label: "Peak Reduction",       value: "21.4%",             color: "#00d4aa" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#64748b]">{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-1">Evening Peak: Before vs After Scheduling</div>
          <div className="text-xs text-[#64748b] mb-4">Koramangala Feeder · kW · 18:00–22:00</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={peakData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Bar dataKey="before" name="Before" fill="#ef4444" opacity={0.7} radius={[3,3,0,0]} />
              <Bar dataKey="after" name="After Nudge" fill="#00d4aa" opacity={0.85} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 space-y-5">
          <div className="text-sm font-semibold text-white">Bandit Parameters</div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Fairness Weight</span>
              <span className="text-[#00d4aa]">{fairness}%</span>
            </div>
            <input type="range" min={0} max={100} value={fairness} onChange={e => setFairness(+e.target.value)} className="w-full accent-[#00d4aa]" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Incentive Strength</span>
              <span className="text-[#f59e0b]">{incentive}%</span>
            </div>
            <input type="range" min={0} max={100} value={incentive} onChange={e => setIncentive(+e.target.value)} className="w-full accent-[#f59e0b]" />
          </div>
          <div className="bg-[#0f1117] rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#64748b]">Peak tariff</span><span className="text-[#ef4444]">₹7.5/kWh</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Off-peak tariff</span><span className="text-[#10b981]">₹3.8/kWh</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Max delay allowed</span><span className="text-white">40 min</span></div>
          </div>
        </div>
      </div>

      {/* AI Nudges Table */}
      <AIPanel title="Tonight's AI-Generated Scheduling Nudges" loading={nudges.loading}
        error={nudges.error} lastFetched={nudges.lastFetched}
        onRefresh={() => nudges.fetch(prompts.scheduleNudges())} color="#00d4aa">
        {data.length === 0 && !nudges.loading ? (
          <p className="text-xs text-[#64748b] text-center py-4">Click refresh to generate AI nudges</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-center gap-1 text-xs text-[#64748b] mb-3">
              <Star size={11} className="text-[#f59e0b]" />
              Delivered via BESCOM Consumer App
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#64748b] border-b border-[#2d3748]">
                  <th className="text-left pb-2">User ID</th>
                  <th className="text-left pb-2">Ward</th>
                  <th className="text-left pb-2">Vehicle</th>
                  <th className="text-left pb-2">Window</th>
                  <th className="text-right pb-2">Tariff</th>
                  <th className="text-right pb-2">Saving</th>
                  <th className="text-left pb-2 pl-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3748]">
                {data.map((u, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-mono text-[#00d4aa]">{u.userId}</td>
                    <td className="py-2.5 text-[#e2e8f0]">{u.ward}</td>
                    <td className="py-2.5 text-[#94a3b8]">{u.vehicle}</td>
                    <td className="py-2.5 font-mono text-[#6366f1]">{u.suggestedWindow}</td>
                    <td className="py-2.5 text-right text-[#10b981]">{u.tariff}</td>
                    <td className="py-2.5 text-right text-[#f59e0b]">₹{u.saving}</td>
                    <td className="py-2.5 pl-3 text-[#64748b] max-w-xs text-[10px]">{u.reason}</td>
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
