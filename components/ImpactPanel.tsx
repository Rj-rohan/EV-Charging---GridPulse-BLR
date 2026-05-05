"use client";
import { useAppStore } from "@/lib/store";
import { Shield, TrendingUp, IndianRupee, Zap, RefreshCw, RotateCcw } from "lucide-react";

export default function ImpactPanel() {
  const { impact, mode, feedbackLoop, addFeedback } = useAppStore();

  return (
    <div className="space-y-4">
      {/* Mode badge */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${
        mode === "live"
          ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"
          : "bg-[#6366f1]/10 border-[#6366f1]/30 text-[#6366f1]"
      }`}>
        <span className={`w-2 h-2 rounded-full ${mode === "live" ? "bg-[#10b981] animate-pulse" : "bg-[#6366f1]"}`} />
        {mode === "live" ? "🟢 Live Mode — Real grid data" : "🔵 Simulation Mode — What-if scenarios"}
      </div>

      {/* Impact metrics */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={13} className="text-[#00d4aa]" />
          <span className="text-xs font-semibold text-white">System Impact Summary</span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: "Peak Reduced",        value: `${impact.peakReduced}%`,    color: "#00d4aa", icon: TrendingUp,   bar: impact.peakReduced / 40 * 100 },
            { label: "CAPEX Saved",         value: `₹${impact.capexSaved}L`,    color: "#10b981", icon: IndianRupee, bar: impact.capexSaved / 50 * 100 },
            { label: "Transformers Saved",  value: `${impact.transformersSaved}`, color: "#6366f1", icon: Zap,        bar: impact.transformersSaved / 5 * 100 },
            { label: "User Satisfaction",   value: `${impact.userSatisfaction}%`, color: "#f59e0b", icon: Shield,    bar: impact.userSatisfaction },
            { label: "CO₂ Avoided",         value: `${impact.co2Avoided}t`,     color: "#ec4899", icon: RefreshCw,  bar: impact.co2Avoided / 10 * 100 },
          ].map(({ label, value, color, icon: Icon, bar }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon size={10} style={{ color }} />
                  <span className="text-[10px] text-[#64748b]">{label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color }}>{value}</span>
              </div>
              <div className="h-1 bg-[#2d3748] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(bar, 100)}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback loop */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <RotateCcw size={13} className="text-[#6366f1]" />
          <span className="text-xs font-semibold text-white">Feedback Loop</span>
        </div>
        <div className="space-y-2">
          {feedbackLoop.map((f, i) => (
            <div key={i} className="rounded-lg p-2 bg-[#0f1117] border border-[#2d3748]">
              <div className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: f.color }} />
                <div>
                  <div className="text-[10px] text-[#e2e8f0] leading-snug">{f.event}</div>
                  <div className="text-[9px] text-[#64748b] mt-0.5">→ {f.action}</div>
                  <div className="text-[9px] text-[#475569] mt-0.5">{f.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[9px] text-[#64748b] text-center">
          Forecast → Schedule → Observe → Retrain · Closed loop
        </div>
      </div>
    </div>
  );
}
