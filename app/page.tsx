"use client";
import { useEffect } from "react";
import Link from "next/link";
import {
  Zap, TrendingUp, CalendarClock, MapPin, GitBranch,
  AlertTriangle, CheckCircle, Activity, ArrowUpRight,
  FlaskConical, IndianRupee, Users, Network, Plug,
  SlidersHorizontal, Smartphone, Wrench, ScanSearch, FileText
} from "lucide-react";
import ImpactPanel from "@/components/ImpactPanel";
import AlertActionMap from "@/components/AlertActionMap";
import DecisionPanel from "@/components/DecisionPanel";
import AIPanel from "@/components/AIPanel";
import { useGroq } from "@/lib/useGroq";
import { prompts, AIDashboardInsight } from "@/lib/groq";

const kpis = [
  { label: "Active DTRs Monitored",    value: "1,247", sub: "+23 this week",       color: "#00d4aa", icon: Activity },
  { label: "EV Registrations (Vahan)", value: "84,312", sub: "Bengaluru · 2024",   color: "#6366f1", icon: Zap },
  { label: "Peak Reduction (Sim)",     value: "21.4%",  sub: "7–10 PM window",     color: "#f59e0b", icon: TrendingUp },
  { label: "Forecast MAPE (24h)",      value: "8.2%",   sub: "vs 23% persistence", color: "#10b981", icon: CheckCircle },
];

const alerts = [
  { type: "warn", msg: "Koramangala DTR-114: Load at 91% capacity",                  time: "2 min ago" },
  { type: "warn", msg: "HSR Layout Feeder F-07: Evening peak spike detected",         time: "8 min ago" },
  { type: "ok",   msg: "Whitefield: Scheduling nudges accepted by 68% users",         time: "15 min ago" },
  { type: "ok",   msg: "Electronic City: 3 new siting recommendations generated",     time: "32 min ago" },
  { type: "warn", msg: "Sarjapur DTR-089: Oil temp alarm threshold approaching",      time: "1 hr ago" },
];

const allModules = [
  { href: "/operations",     label: "Grid Operations",   desc: "Live SCADA · Alarms · AI actions",              color: "#ef4444", icon: Activity },
  { href: "/forecasting",    label: "Forecasting",       desc: "Graph WaveNet · 15-min · 24–72h",               color: "#6366f1", icon: TrendingUp },
  { href: "/scheduling",     label: "Scheduling",        desc: "Contextual bandit · Nudge-based",               color: "#00d4aa", icon: CalendarClock },
  { href: "/tariff",         label: "Tariff Engine",     desc: "ToU pricing · Budget-constrained",              color: "#f59e0b", icon: IndianRupee },
  { href: "/behavior",       label: "User Behavior",     desc: "Clusters · Acceptance analytics",               color: "#10b981", icon: Users },
  { href: "/explainability", label: "Explainability",    desc: "SHAP · Per-DTR reasoning · Audit",              color: "#a78bfa", icon: FlaskConical },
  { href: "/federation",     label: "Federated Control", desc: "Privacy-preserving · Gradient exchange",        color: "#06b6d4", icon: Network },
  { href: "/integration",    label: "SCADA Integration", desc: "Connectors · Latency · Fallback mode",          color: "#84cc16", icon: Plug },
  { href: "/what-if",        label: "Scenario Planner",  desc: "What-if · SUMO twin · Decision support",        color: "#f472b6", icon: SlidersHorizontal },
  { href: "/consumer",       label: "Consumer View",     desc: "Mobile nudge UI · Accept/Modify/Ignore",        color: "#fb923c", icon: Smartphone },
  { href: "/capex",          label: "Asset Upgrade",     desc: "Upgrade priority · Cost vs benefit",            color: "#34d399", icon: Wrench },
  { href: "/anomaly",        label: "Anomaly Detection", desc: "Gaming · Unauthorized chargers · Spikes",       color: "#f87171", icon: ScanSearch },
  { href: "/siting",         label: "Siting Engine",     desc: "NSGA-II · 500m hex · SHAP explainability",      color: "#fbbf24", icon: MapPin },
  { href: "/digital-twin",   label: "Digital Twin",      desc: "SUMO · 3 corridors · What-if",                  color: "#ec4899", icon: GitBranch },
  { href: "/ab-test",        label: "A/B Testing",       desc: "Policy experiments · Statistical significance", color: "#818cf8", icon: FlaskConical },
  { href: "/report",         label: "Report Generator",  desc: "Auto PDF · BESCOM-ready · Council meetings",    color: "#94a3b8", icon: FileText },
];

export default function DashboardPage() {
  const insight = useGroq<AIDashboardInsight | null>(null);

  useEffect(() => { insight.fetch(prompts.dashboardInsight()); }, []);

  const statusColor: Record<string, string> = { critical: "#ef4444", warn: "#f59e0b", stable: "#10b981" };
  const ins = insight.data;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">GridPulse BLR</h1>
          <p className="text-[#64748b] text-sm mt-1">
            Federated Demand-Shaping & Siting Engine · BESCOM EV Transition · Theme 9
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-xs text-[#00d4aa]">
          <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
          Live Feed Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#64748b]">{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs mt-1" style={{ color }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Module grid */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allModules.map(({ href, label, desc, color, icon: Icon }) => (
            <Link key={href} href={href}
              className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-3 hover:border-[#00d4aa]/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <ArrowUpRight size={11} className="text-[#2d3748] group-hover:text-[#00d4aa] transition-colors" />
              </div>
              <div className="font-semibold text-white text-xs mb-0.5">{label}</div>
              <div className="text-[10px] text-[#64748b] leading-snug">{desc}</div>
            </Link>
          ))}
        </div>

        {/* Right panel: impact + alerts */}
        <div className="lg:col-span-1 space-y-4">
          <ImpactPanel />
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white">Live Alerts</span>
              <span className="text-[10px] text-[#64748b]">SCADA Feed</span>
            </div>
            <div className="space-y-2.5">
              {alerts.map((a, i) => (
                <div key={i} className="flex gap-2 items-start">
                  {a.type === "warn"
                    ? <AlertTriangle size={11} className="text-[#f59e0b] mt-0.5 shrink-0" />
                    : <CheckCircle size={11} className="text-[#10b981] mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-[10px] text-[#e2e8f0] leading-snug">{a.msg}</p>
                    <p className="text-[9px] text-[#64748b] mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Live Insight */}
      <AIPanel title="AI Grid Status Insight" loading={insight.loading} error={insight.error}
        lastFetched={insight.lastFetched} onRefresh={() => insight.fetch(prompts.dashboardInsight())} color="#00d4aa">
        {ins ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: `${statusColor[ins.systemStatus]}20`, color: statusColor[ins.systemStatus] }}>
                {ins.systemStatus.toUpperCase()}
              </span>
              <p className="text-sm font-semibold text-white leading-snug">{ins.headline}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#0f1117] rounded-lg p-3 border border-[#2d3748]">
                <div className="text-[#64748b] mb-1">Critical DTRs</div>
                <div className="flex flex-wrap gap-1">{ins.criticalDtrs.map(d => (
                  <span key={d} className="font-mono text-[#ef4444] bg-[#ef4444]/10 px-1.5 py-0.5 rounded text-[10px]">{d}</span>
                ))}</div>
              </div>
              <div className="bg-[#0f1117] rounded-lg p-3 border border-[#2d3748]">
                <div className="text-[#64748b] mb-1">Top Action</div>
                <div className="text-[#e2e8f0] leading-snug">{ins.topAction}</div>
              </div>
              <div className="bg-[#0f1117] rounded-lg p-3 border border-[#2d3748]">
                <div className="text-[#64748b] mb-1">Peak Forecast</div>
                <div className="text-[#f59e0b] font-medium">{ins.peakForecast}</div>
              </div>
            </div>
          </div>
        ) : !insight.loading && (
          <p className="text-xs text-[#64748b] text-center py-3">Click refresh to get live AI grid insight</p>
        )}
      </AIPanel>

      {/* Alert → Action Mapping */}
      <AlertActionMap />

      {/* Decision Justification */}
      <DecisionPanel />

      {/* Sub-division status */}
      <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-4">Sub-Division Federated Model Status</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "South-East (Koramangala / HSR)",      dtrs: 412, sync: "2 min ago",  accuracy: "91.2%", status: "ok" },
            { name: "East (Whitefield / Marathahalli)",     dtrs: 389, sync: "5 min ago",  accuracy: "88.7%", status: "ok" },
            { name: "South (Electronic City / Sarjapur)",   dtrs: 446, sync: "11 min ago", accuracy: "89.4%", status: "warn" },
          ].map((sd) => (
            <div key={sd.name} className="bg-[#0f1117] rounded-lg p-3 border border-[#2d3748]">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${sd.status === "ok" ? "bg-[#10b981]" : "bg-[#f59e0b]"}`} />
                <span className="text-xs font-medium text-white">{sd.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><div className="text-sm font-bold text-[#00d4aa]">{sd.dtrs}</div><div className="text-[10px] text-[#64748b]">DTRs</div></div>
                <div><div className="text-sm font-bold text-white">{sd.accuracy}</div><div className="text-[10px] text-[#64748b]">Accuracy</div></div>
                <div><div className="text-[10px] font-medium text-[#10b981]">Synced</div><div className="text-[10px] text-[#64748b]">{sd.sync}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
