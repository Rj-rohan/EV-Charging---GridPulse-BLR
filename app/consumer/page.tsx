"use client";
import { useState } from "react";
import { CheckCircle, Clock, X, Zap, IndianRupee, Battery } from "lucide-react";

const user = {
  name: "Rahul M.",
  vehicle: "Tata Nexon EV Max",
  battery: 68,
  targetSoc: 90,
  departure: "08:15 AM",
  ward: "Koramangala 5th Block",
  totalSaved: 847,
};

const windows = [
  {
    id: 1, label: "Best for Grid", start: "23:00", end: "05:30",
    tariff: 3.8, saving: 62, peakReduction: "High", recommended: true,
    reason: "Off-peak window. Lowest tariff. Grid-friendly. Fully charged by 05:30.",
  },
  {
    id: 2, label: "Balanced", start: "21:30", end: "04:00",
    tariff: 4.2, saving: 44, peakReduction: "Medium", recommended: false,
    reason: "Moderate tariff. Starts earlier if you prefer. Still avoids 19–21 peak.",
  },
  {
    id: 3, label: "Charge Now", start: "20:30", end: "23:00",
    tariff: 6.8, saving: 0, peakReduction: "None", recommended: false,
    reason: "Peak tariff applies. Grid is stressed. No incentive discount.",
  },
];

export default function ConsumerPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [response, setResponse] = useState<"accepted" | "modified" | "ignored" | null>(null);
  const [modifiedTime, setModifiedTime] = useState("22:00");

  function respond(type: "accepted" | "modified" | "ignored") {
    setResponse(type);
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-sm space-y-4">
        {/* Phone frame */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-3xl p-5 shadow-2xl">
          {/* App header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00d4aa] flex items-center justify-center">
                <Zap size={13} className="text-[#0f1117]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">BESCOM EV</div>
                <div className="text-[9px] text-[#64748b]">GridPulse</div>
              </div>
            </div>
            <div className="text-[10px] text-[#64748b]">20:14</div>
          </div>

          {/* User card */}
          <div className="bg-[#0f1117] rounded-2xl p-4 mb-4 border border-[#2d3748]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">{user.name}</div>
                <div className="text-[10px] text-[#64748b]">{user.vehicle}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#64748b]">Departure</div>
                <div className="text-sm font-bold text-[#00d4aa]">{user.departure}</div>
              </div>
            </div>
            {/* Battery */}
            <div className="flex items-center gap-2 mb-1">
              <Battery size={13} className="text-[#64748b]" />
              <div className="flex-1 h-2.5 bg-[#2d3748] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#10b981]"
                  style={{ width: `${user.battery}%` }} />
              </div>
              <span className="text-xs text-white font-bold">{user.battery}%</span>
            </div>
            <div className="text-[10px] text-[#64748b]">Target: {user.targetSoc}% · Need ~{Math.round((user.targetSoc - user.battery) * 0.72)} kWh</div>
          </div>

          {/* Notification */}
          {!response && (
            <div className="bg-[#6366f1]/15 border border-[#6366f1]/30 rounded-2xl p-3 mb-4">
              <div className="text-xs font-semibold text-[#6366f1] mb-1">⚡ Charging Suggestion</div>
              <div className="text-[10px] text-[#94a3b8]">
                Your feeder is under stress tonight. Shift charging to save money and help the grid.
              </div>
            </div>
          )}

          {/* Windows */}
          {!response && (
            <div className="space-y-2 mb-4">
              {windows.map(w => (
                <button key={w.id} onClick={() => setSelected(w.id)}
                  className={`w-full text-left rounded-2xl p-3 border transition-all ${selected === w.id ? "border-[#00d4aa]/60 bg-[#00d4aa]/10" : "border-[#2d3748] bg-[#0f1117]"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{w.start} – {w.end}</span>
                      {w.recommended && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] font-bold">BEST</span>
                      )}
                    </div>
                    <span className="text-xs font-bold" style={{ color: w.tariff < 5 ? "#10b981" : "#ef4444" }}>
                      ₹{w.tariff}/kWh
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#64748b]">{w.label}</span>
                    {w.saving > 0 && (
                      <span className="text-[10px] text-[#10b981] font-medium">Save ₹{w.saving}</span>
                    )}
                  </div>
                  {selected === w.id && (
                    <div className="text-[10px] text-[#94a3b8] mt-1.5 leading-relaxed">{w.reason}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Modify input */}
          {!response && selected && (
            <div className="mb-3">
              <div className="text-[10px] text-[#64748b] mb-1">Or start at a custom time:</div>
              <input type="time" value={modifiedTime} onChange={e => setModifiedTime(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2d3748] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6366f1]" />
            </div>
          )}

          {/* Action buttons */}
          {!response && (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => respond("accepted")} disabled={!selected}
                className="flex flex-col items-center gap-1 py-2.5 rounded-2xl bg-[#10b981] text-white text-[10px] font-bold disabled:opacity-40 hover:bg-[#059669] transition-colors">
                <CheckCircle size={14} />
                Accept
              </button>
              <button onClick={() => respond("modified")} disabled={!selected}
                className="flex flex-col items-center gap-1 py-2.5 rounded-2xl bg-[#6366f1] text-white text-[10px] font-bold disabled:opacity-40 hover:bg-[#4f46e5] transition-colors">
                <Clock size={14} />
                Modify
              </button>
              <button onClick={() => respond("ignored")}
                className="flex flex-col items-center gap-1 py-2.5 rounded-2xl bg-[#2d3748] text-[#94a3b8] text-[10px] font-bold hover:bg-[#374151] transition-colors">
                <X size={14} />
                Ignore
              </button>
            </div>
          )}

          {/* Response state */}
          {response === "accepted" && (
            <div className="text-center py-4">
              <CheckCircle size={32} className="text-[#10b981] mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Charging Scheduled!</div>
              <div className="text-xs text-[#64748b] mt-1">
                {windows.find(w => w.id === selected)?.start} – {windows.find(w => w.id === selected)?.end}
              </div>
              <div className="mt-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-3">
                <div className="text-xs text-[#10b981] font-semibold">You save ₹{windows.find(w => w.id === selected)?.saving ?? 0} tonight</div>
                <div className="text-[10px] text-[#64748b] mt-0.5">Total saved this month: ₹{user.totalSaved}</div>
              </div>
              <button onClick={() => { setResponse(null); setSelected(null); }}
                className="mt-3 text-[10px] text-[#64748b] underline">Change</button>
            </div>
          )}
          {response === "modified" && (
            <div className="text-center py-4">
              <Clock size={32} className="text-[#6366f1] mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Modified to {modifiedTime}</div>
              <div className="text-xs text-[#64748b] mt-1">Bandit model updated with your preference</div>
              <button onClick={() => { setResponse(null); setSelected(null); }}
                className="mt-3 text-[10px] text-[#64748b] underline">Change</button>
            </div>
          )}
          {response === "ignored" && (
            <div className="text-center py-4">
              <X size={32} className="text-[#ef4444] mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Noted</div>
              <div className="text-xs text-[#64748b] mt-1">We'll adjust future suggestions based on your preference</div>
              <button onClick={() => { setResponse(null); setSelected(null); }}
                className="mt-3 text-[10px] text-[#64748b] underline">Reconsider</button>
            </div>
          )}
        </div>

        {/* Savings summary below phone */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-xs font-semibold text-white mb-3">Your Savings This Month</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-[#10b981]">₹{user.totalSaved}</div>
              <div className="text-[10px] text-[#64748b]">Total saved</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#6366f1]">23</div>
              <div className="text-[10px] text-[#64748b]">Nudges accepted</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#00d4aa]">74%</div>
              <div className="text-[10px] text-[#64748b]">Acceptance rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
