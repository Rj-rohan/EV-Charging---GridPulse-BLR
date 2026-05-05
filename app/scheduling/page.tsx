"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { CheckCircle, Clock, Users, Zap, Star } from "lucide-react";

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

const users = [
  { id: "U-1042", ward: "Koramangala", vehicle: "Tata Nexon EV", departure: "08:15", soc: 80, window: "23:00–06:00", tariff: "₹4.2/kWh", status: "accepted", delay: 18 },
  { id: "U-2187", ward: "HSR Layout", vehicle: "Ola S1 Pro", departure: "09:00", soc: 90, window: "22:30–05:30", tariff: "₹4.0/kWh", status: "accepted", delay: 22 },
  { id: "U-3301", ward: "Whitefield", vehicle: "MG ZS EV", departure: "07:30", soc: 75, window: "00:00–06:00", tariff: "₹3.8/kWh", status: "modified", delay: 35 },
  { id: "U-0891", ward: "Sarjapur", vehicle: "Tata Tigor EV", departure: "08:45", soc: 85, window: "21:00–04:00", tariff: "₹4.5/kWh", status: "ignored", delay: 0 },
  { id: "U-4412", ward: "Electronic City", vehicle: "Hyundai Kona", departure: "09:30", soc: 70, window: "23:30–06:30", tariff: "₹3.9/kWh", status: "accepted", delay: 28 },
  { id: "U-1773", ward: "Marathahalli", vehicle: "Nexon EV Max", departure: "08:00", soc: 95, window: "22:00–05:00", tariff: "₹4.1/kWh", status: "accepted", delay: 15 },
];

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  accepted: { bg: "#10b98120", color: "#10b981", label: "Accepted" },
  modified: { bg: "#f59e0b20", color: "#f59e0b", label: "Modified" },
  ignored: { bg: "#ef444420", color: "#ef4444", label: "Ignored" },
};

export default function SchedulingPage() {
  const [fairness, setFairness] = useState(70);
  const [incentive, setIncentive] = useState(50);

  const accepted = users.filter((u) => u.status === "accepted").length;
  const avgDelay = Math.round(users.filter((u) => u.delay > 0).reduce((s, u) => s + u.delay, 0) / users.filter((u) => u.delay > 0).length);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Charging Scheduler</h1>
        <p className="text-[#64748b] text-sm mt-1">
          Contextual Bandit · Constraint Satisfaction · Nudge-based · Fairness-aware
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Users Nudged Tonight", value: `${users.length}`, color: "#6366f1" },
          { icon: CheckCircle, label: "Acceptance Rate", value: `${Math.round((accepted / users.length) * 100)}%`, color: "#10b981" },
          { icon: Clock, label: "Avg Delay (mins)", value: `${avgDelay} min`, color: "#f59e0b" },
          { icon: Zap, label: "Peak Reduction", value: "21.4%", color: "#00d4aa" },
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

      <div className="grid grid-cols-3 gap-4">
        {/* Peak chart */}
        <div className="col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-1">Evening Peak: Before vs After Scheduling</div>
          <div className="text-xs text-[#64748b] mb-4">Koramangala Feeder · kW · 18:00–22:00</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={peakData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
              <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Bar dataKey="before" name="Before" fill="#ef4444" opacity={0.7} radius={[3, 3, 0, 0]} />
              <Bar dataKey="after" name="After Nudge" fill="#00d4aa" opacity={0.85} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bandit controls */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 space-y-5">
          <div className="text-sm font-semibold text-white">Bandit Parameters</div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Fairness Weight</span>
              <span className="text-[#00d4aa]">{fairness}%</span>
            </div>
            <input type="range" min={0} max={100} value={fairness} onChange={(e) => setFairness(+e.target.value)}
              className="w-full accent-[#00d4aa]" />
            <div className="text-[10px] text-[#64748b] mt-1">Prevents same users from shifting every night</div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">Incentive Strength</span>
              <span className="text-[#f59e0b]">{incentive}%</span>
            </div>
            <input type="range" min={0} max={100} value={incentive} onChange={(e) => setIncentive(+e.target.value)}
              className="w-full accent-[#f59e0b]" />
            <div className="text-[10px] text-[#64748b] mt-1">ToU tariff discount magnitude</div>
          </div>
          <div className="bg-[#0f1117] rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#64748b]">Peak tariff</span><span className="text-[#ef4444]">₹7.5/kWh</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Off-peak tariff</span><span className="text-[#10b981]">₹3.8/kWh</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Max delay allowed</span><span className="text-white">40 min</span></div>
          </div>
        </div>
      </div>

      {/* User table */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-white">Tonight's Scheduling Nudges</div>
          <div className="flex items-center gap-1 text-xs text-[#64748b]">
            <Star size={11} className="text-[#f59e0b]" />
            Delivered via BESCOM Consumer App
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[#64748b] border-b border-[#2d3748]">
              <th className="text-left pb-2">User ID</th>
              <th className="text-left pb-2">Ward</th>
              <th className="text-left pb-2">Vehicle</th>
              <th className="text-right pb-2">Departure</th>
              <th className="text-right pb-2">Min SoC %</th>
              <th className="text-left pb-2">Suggested Window</th>
              <th className="text-right pb-2">Tariff</th>
              <th className="text-right pb-2">Delay</th>
              <th className="text-right pb-2">Response</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d3748]">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-2.5 font-mono text-[#00d4aa]">{u.id}</td>
                <td className="py-2.5 text-[#e2e8f0]">{u.ward}</td>
                <td className="py-2.5 text-[#94a3b8]">{u.vehicle}</td>
                <td className="py-2.5 text-right text-[#94a3b8]">{u.departure}</td>
                <td className="py-2.5 text-right text-[#94a3b8]">{u.soc}%</td>
                <td className="py-2.5 font-mono text-[#6366f1]">{u.window}</td>
                <td className="py-2.5 text-right text-[#10b981]">{u.tariff}</td>
                <td className="py-2.5 text-right text-[#94a3b8]">{u.delay > 0 ? `${u.delay}m` : "—"}</td>
                <td className="py-2.5 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: statusStyle[u.status].bg, color: statusStyle[u.status].color }}>
                    {statusStyle[u.status].label}
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
