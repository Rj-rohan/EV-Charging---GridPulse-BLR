"use client";
import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { GitBranch, Play, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";

const corridors = ["Outer Ring Road", "Whitefield–Marathahalli", "Electronic City"];

const baseLoad = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0") + ":00";
  const base = 200 + Math.sin((i - 6) * 0.4) * 80 + (i >= 19 && i <= 22 ? 100 : 0);
  return { time: h, baseline: +base.toFixed(0) };
});

function generateScenario(chargers: number, corridor: string) {
  const multiplier = corridor === "Outer Ring Road" ? 1.2 : corridor === "Whitefield–Marathahalli" ? 1.0 : 0.85;
  return baseLoad.map((d) => ({
    ...d,
    scenario: +(d.baseline + (chargers / 200) * multiplier * (d.time >= "19:00" && d.time <= "22:00" ? 120 : 30)).toFixed(0),
  }));
}

const events = [
  { type: "ok", msg: "Simulation initialized · SUMO engine ready", time: "00:00" },
  { type: "ok", msg: "Baseline load profile loaded from SCADA historian", time: "00:01" },
  { type: "warn", msg: "Sarjapur feeder headroom: 47 kW remaining at 20:00", time: "00:03" },
  { type: "warn", msg: "DTR-089 projected to exceed 95% capacity by 20:30", time: "00:04" },
  { type: "ok", msg: "Scheduling nudges applied · Peak reduced by 18.2%", time: "00:06" },
];

export default function DigitalTwinPage() {
  const [corridor, setCorridor] = useState(corridors[0]);
  const [chargers, setChargers] = useState(100);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const data = generateScenario(chargers, corridor);
  const maxScenario = Math.max(...data.map((d) => d.scenario));
  const maxBaseline = Math.max(...data.map((d) => d.baseline));
  const delta = (((maxScenario - maxBaseline) / maxBaseline) * 100).toFixed(1);
  const overloaded = maxScenario > 420;

  function runSim() {
    setRunning(true);
    setTimeout(() => { setRunning(false); setRan(true); }, 1800);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Digital Twin Simulator</h1>
        <p className="text-[#64748b] text-sm mt-1">
          SUMO-based · 3 Bengaluru Corridors · What-if Scenario Planning
        </p>
      </div>

      {/* Config */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 space-y-4">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <GitBranch size={15} className="text-[#ec4899]" />
            Scenario Configuration
          </div>

          <div>
            <div className="text-xs text-[#64748b] mb-2">Corridor</div>
            <div className="flex gap-2">
              {corridors.map((c) => (
                <button key={c} onClick={() => { setCorridor(c); setRan(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${corridor === c ? "bg-[#ec4899]/20 text-[#ec4899] border border-[#ec4899]/40" : "bg-[#0f1117] text-[#64748b] border border-[#2d3748] hover:border-[#64748b]"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748b]">New Fast Chargers Deployed (7.4 kW each)</span>
              <span className="text-[#ec4899] font-bold">{chargers}</span>
            </div>
            <input type="range" min={10} max={500} step={10} value={chargers}
              onChange={(e) => { setChargers(+e.target.value); setRan(false); }}
              className="w-full accent-[#ec4899]" />
            <div className="flex justify-between text-[10px] text-[#64748b] mt-1">
              <span>10</span><span>500 chargers</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={runSim} disabled={running}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ec4899] text-white text-sm font-medium hover:bg-[#db2777] transition-colors disabled:opacity-50">
              <Play size={13} />
              {running ? "Simulating…" : "Run Simulation"}
            </button>
            <button onClick={() => { setRan(false); setChargers(100); setCorridor(corridors[0]); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d3748] text-[#94a3b8] text-sm hover:bg-[#374151] transition-colors">
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        {/* Result summary */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4 space-y-3">
          <div className="text-sm font-semibold text-white">Scenario Result</div>
          {ran ? (
            <>
              <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${overloaded ? "bg-[#ef4444]/10 border border-[#ef4444]/20" : "bg-[#10b981]/10 border border-[#10b981]/20"}`}>
                {overloaded
                  ? <AlertTriangle size={13} className="text-[#ef4444]" />
                  : <CheckCircle size={13} className="text-[#10b981]" />}
                <span style={{ color: overloaded ? "#ef4444" : "#10b981" }}>
                  {overloaded ? "Feeder overload risk detected" : "Feeder within safe limits"}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[#64748b]">Peak load increase</span><span className="text-[#ec4899] font-bold">+{delta}%</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Max load (scenario)</span><span className="text-white">{maxScenario} kW</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Max load (baseline)</span><span className="text-[#64748b]">{maxBaseline} kW</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Chargers deployed</span><span className="text-white">{chargers}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Corridor</span><span className="text-white truncate ml-2">{corridor}</span></div>
              </div>
              <div className="bg-[#0f1117] rounded-lg p-2 text-[10px] text-[#64748b]">
                {overloaded
                  ? `Deploying ${chargers} chargers on ${corridor} will cause transformer stress. Recommend phased rollout with scheduling nudges.`
                  : `${chargers} chargers on ${corridor} is feasible. Scheduling nudges can further reduce peak by ~18%.`}
              </div>
            </>
          ) : (
            <div className="text-xs text-[#64748b] py-4 text-center">Configure scenario and run simulation</div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-1">Load Profile: Baseline vs Scenario</div>
        <div className="text-xs text-[#64748b] mb-4">{corridor} · kW · 24h</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="scenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} interval={3} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit=" kW" />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8 }} />
            <ReferenceLine y={420} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "Feeder Limit", fill: "#ef4444", fontSize: 10 }} />
            <Area type="monotone" dataKey="baseline" stroke="#6366f1" fill="url(#baseGrad)" strokeWidth={2} name="Baseline" />
            {ran && <Area type="monotone" dataKey="scenario" stroke="#ec4899" fill="url(#scenGrad)" strokeWidth={2} name="Scenario" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Event log */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-4">Simulation Event Log</div>
        <div className="space-y-2">
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <span className="font-mono text-[#64748b] shrink-0">{e.time}</span>
              {e.type === "warn"
                ? <AlertTriangle size={12} className="text-[#f59e0b] mt-0.5 shrink-0" />
                : <CheckCircle size={12} className="text-[#10b981] mt-0.5 shrink-0" />}
              <span className="text-[#94a3b8]">{e.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
