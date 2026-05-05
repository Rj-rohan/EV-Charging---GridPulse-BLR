"use client";
import { useState, useEffect } from "react";
import { Network, CheckCircle, AlertTriangle, RefreshCw, Shield, Lock } from "lucide-react";

const subdivisions = [
  { id: "SD-01", name: "South-East (Koramangala / HSR)", dtrs: 412, status: "active", lastSync: 2, accuracy: 91.2, gradients: 1847 },
  { id: "SD-02", name: "East (Whitefield / Marathahalli)", dtrs: 389, status: "active", lastSync: 5, accuracy: 88.7, gradients: 1623 },
  { id: "SD-03", name: "South (Electronic City / Sarjapur)", dtrs: 446, status: "syncing", lastSync: 11, accuracy: 89.4, gradients: 1891 },
];

const gradientLog = [
  { time: "20:14:32", from: "SD-01", to: "Central", size: "2.4 MB", status: "ok" },
  { time: "20:14:18", from: "SD-02", to: "Central", size: "2.1 MB", status: "ok" },
  { time: "20:13:55", from: "SD-03", to: "Central", size: "2.6 MB", status: "ok" },
  { time: "20:13:41", from: "SD-01", to: "Central", size: "2.3 MB", status: "ok" },
  { time: "20:13:22", from: "SD-02", to: "Central", size: "2.2 MB", status: "ok" },
  { time: "20:12:58", from: "SD-03", to: "Central", size: "2.5 MB", status: "ok" },
];

const statusColor: Record<string, string> = {
  active: "#10b981", syncing: "#f59e0b", failed: "#ef4444"
};

export default function FederationPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Federated Learning Control</h1>
        <p className="text-[#64748b] text-sm mt-1">Privacy-preserving · No raw data sharing · Gradient-only exchange · BESCOM policy compliant</p>
      </div>

      {/* Privacy banner */}
      <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-[#10b981] mt-0.5 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-[#10b981] mb-1">No Consumer Data Leaves Sub-Division</div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Each BESCOM sub-division runs its own local model on its own SCADA data. Only gradient updates (model weight deltas) are exchanged with the central aggregator. No raw consumption data, no user identifiers, no location traces cross the boundary. This architecture satisfies the policy constraint that no hosted LLM or external service touches sensitive grid data.
          </p>
        </div>
      </div>

      {/* Sub-division status */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network size={14} className="text-[#6366f1]" />
            <span className="text-sm font-semibold text-white">Sub-Division Model Status</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <RefreshCw size={11} className="text-[#00d4aa]" />
            <span>Updated <span className="text-[#00d4aa]">{tick * 3}s ago</span></span>
          </div>
        </div>

        <div className="space-y-3">
          {subdivisions.map(sd => (
            <div key={sd.id} className="rounded-xl p-4 bg-[#0f1117] border border-[#2d3748]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusColor[sd.status] }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#6366f1]">{sd.id}</span>
                      <span className="text-xs text-white">{sd.name}</span>
                    </div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">{sd.dtrs} DTRs monitored</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full font-medium capitalize"
                  style={{ background: `${statusColor[sd.status]}20`, color: statusColor[sd.status] }}>
                  {sd.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-[#64748b] mb-1">Last Sync</div>
                  <div className="text-sm font-bold text-white">{sd.lastSync} min ago</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-[#64748b] mb-1">Model Accuracy</div>
                  <div className="text-sm font-bold text-[#00d4aa]">{sd.accuracy}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-[#64748b] mb-1">Gradients Sent</div>
                  <div className="text-sm font-bold text-[#6366f1]">{sd.gradients.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gradient exchange log */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-4">Gradient Exchange Log</div>
          <div className="space-y-2">
            {gradientLog.map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-xs rounded-lg p-2.5 bg-[#0f1117] border border-[#2d3748]">
                <span className="font-mono text-[#64748b] shrink-0">{log.time}</span>
                <span className="font-mono text-[#6366f1] shrink-0">{log.from}</span>
                <span className="text-[#64748b]">→</span>
                <span className="text-[#94a3b8] shrink-0">{log.to}</span>
                <span className="text-[#64748b] flex-1 text-right">{log.size}</span>
                <CheckCircle size={11} className="text-[#10b981] shrink-0" />
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] text-[#64748b] text-center">
            Gradient updates every ~30 seconds · Encrypted TLS 1.3 · No raw SCADA data transmitted
          </div>
        </div>

        {/* Privacy guarantees */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={14} className="text-[#f59e0b]" />
            <span className="text-sm font-semibold text-white">Privacy Guarantees</span>
          </div>
          <div className="space-y-3">
            {[
              { title: "No raw consumption data shared", desc: "Only model weight gradients (∂L/∂θ) leave the sub-division. No kWh values, no timestamps, no user IDs." },
              { title: "Differential privacy noise injection", desc: "Gaussian noise (σ=0.01) added to gradients before transmission. Prevents gradient inversion attacks." },
              { title: "Secure aggregation protocol", desc: "Central aggregator cannot see individual sub-division gradients — only the encrypted sum." },
              { title: "Local model autonomy", desc: "Each sub-division can operate independently if central link fails. No single point of failure." },
              { title: "Audit trail", desc: "Every gradient exchange logged with cryptographic hash. Tamper-evident for compliance review." },
            ].map((g, i) => (
              <div key={i} className="rounded-lg p-3 bg-[#0f1117] border border-[#2d3748]">
                <div className="flex items-start gap-2">
                  <CheckCircle size={12} className="text-[#10b981] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-white mb-0.5">{g.title}</div>
                    <div className="text-[10px] text-[#64748b] leading-relaxed">{g.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture diagram (text-based) */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-4">Federated Architecture</div>
        <div className="font-mono text-xs text-[#94a3b8] leading-relaxed space-y-1">
          <div className="text-[#6366f1]">┌─ Sub-Division SD-01 ────────────────────┐</div>
          <div>│  Local SCADA → Local Model (GNN)       │</div>
          <div>│  Train on local data                   │</div>
          <div>│  Compute gradients ∇θ                  │</div>
          <div>│  Add DP noise: ∇θ + N(0, σ²)          │</div>
          <div className="text-[#f59e0b]">│  ↓ Send encrypted gradients only       │</div>
          <div className="text-[#6366f1]">└────────────────────────────────────────┘</div>
          <div className="text-center text-[#64748b]">↓ ↓ ↓</div>
          <div className="text-[#00d4aa]">┌─ Central Aggregator ────────────────────┐</div>
          <div>│  Receive gradients from all SDs        │</div>
          <div>│  Aggregate: θ_global ← Σ ∇θ_i / n      │</div>
          <div>│  Broadcast updated weights              │</div>
          <div className="text-[#00d4aa]">└────────────────────────────────────────┘</div>
          <div className="text-center text-[#64748b]">↓ ↓ ↓</div>
          <div className="text-[#6366f1]">┌─ Sub-Division SD-02, SD-03 ─────────────┐</div>
          <div>│  Receive global weights                 │</div>
          <div>│  Update local model                     │</div>
          <div>│  Continue local training                │</div>
          <div className="text-[#6366f1]">└────────────────────────────────────────┘</div>
        </div>
      </div>
    </div>
  );
}
