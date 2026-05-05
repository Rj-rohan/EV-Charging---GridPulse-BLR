"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore, walkthroughSteps } from "@/lib/store";
import {
  TrendingUp, ShieldAlert, IndianRupee, Users, GitBranch,
  Wrench, ScanSearch, ChevronRight, Play, Zap, Monitor, FlaskConical,
} from "lucide-react";

const workflowSteps = [
  { label: "Forecast Risk",     href: "/forecasting",  icon: TrendingUp,   color: "#ef4444" },
  { label: "Detect Peak",       href: "/operations",   icon: ShieldAlert,  color: "#f97316" },
  { label: "Apply Tariff",      href: "/tariff",       icon: IndianRupee,  color: "#f59e0b" },
  { label: "Shift Behavior",    href: "/scheduling",   icon: Users,        color: "#6366f1" },
  { label: "Validate Twin",     href: "/digital-twin", icon: GitBranch,    color: "#00d4aa" },
  { label: "Plan Infra",        href: "/capex",        icon: Wrench,       color: "#10b981" },
  { label: "Monitor Anomalies", href: "/anomaly",      icon: ScanSearch,   color: "#ec4899" },
];

export default function TopBar() {
  const path = usePathname();
  const router = useRouter();
  const { mode, setMode, walkthroughActive, walkthroughStep, startWalkthrough, nextStep, prevStep, stopWalkthrough, impact } = useAppStore();

  const activeIdx = workflowSteps.findIndex(s => s.href === path);
  const currentWTStep = walkthroughSteps[walkthroughStep];

  function handleWalkthroughNext() {
    if (walkthroughStep < walkthroughSteps.length - 1) {
      router.push(walkthroughSteps[walkthroughStep + 1].page);
      nextStep();
    } else {
      stopWalkthrough();
    }
  }

  function handleWalkthroughStart() {
    startWalkthrough();
    router.push(walkthroughSteps[0].page);
  }

  return (
    <div className="fixed top-0 left-64 right-0 z-40 bg-[#0f1117] border-b border-[#2d3748]">
      {/* Walkthrough overlay banner */}
      {walkthroughActive && (
        <div className="px-4 py-2 flex items-center gap-4 border-b border-[#2d3748]"
          style={{ background: `${currentWTStep.color}12`, borderBottomColor: `${currentWTStep.color}30` }}>
          <div className="flex items-center gap-2 shrink-0">
            <FlaskConical size={13} style={{ color: currentWTStep.color }} />
            <span className="text-xs font-bold" style={{ color: currentWTStep.color }}>
              WALKTHROUGH {walkthroughStep + 1}/{walkthroughSteps.length}
            </span>
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-white">{currentWTStep.label}: </span>
            <span className="text-xs text-[#94a3b8]">{currentWTStep.description}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${currentWTStep.color}25`, color: currentWTStep.color }}>
              {currentWTStep.metric}
            </span>
            <button onClick={() => { prevStep(); if (walkthroughStep > 0) router.push(walkthroughSteps[walkthroughStep - 1].page); }}
              disabled={walkthroughStep === 0}
              className="px-2 py-1 rounded text-xs text-[#64748b] border border-[#2d3748] hover:border-[#64748b] disabled:opacity-30 transition-colors">
              ← Back
            </button>
            <button onClick={handleWalkthroughNext}
              className="px-3 py-1 rounded text-xs font-semibold text-white transition-colors"
              style={{ background: currentWTStep.color }}>
              {walkthroughStep < walkthroughSteps.length - 1 ? "Next →" : "Finish ✓"}
            </button>
            <button onClick={stopWalkthrough} className="text-[#64748b] hover:text-white text-xs px-1">✕</button>
          </div>
        </div>
      )}

      {/* Main top bar */}
      <div className="flex items-center gap-0 px-4 h-11">
        {/* Workflow ribbon */}
        <div className="flex items-center gap-0 flex-1 overflow-x-auto">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            const isActive = step.href === path;
            const isWTActive = walkthroughActive && walkthroughSteps[walkthroughStep].page === step.href;
            return (
              <div key={step.href} className="flex items-center shrink-0">
                <Link href={step.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isActive ? "text-white" : "text-[#64748b] hover:text-[#94a3b8]"
                  } ${isWTActive ? "ring-1 ring-offset-1 ring-offset-[#0f1117]" : ""}`}
                  style={{
                    background: isActive ? `${step.color}20` : "transparent",
                    color: isActive ? step.color : undefined,
                  }}>
                  <Icon size={12} />
                  <span className="whitespace-nowrap">{step.label}</span>
                  {isActive && <span className="w-1 h-1 rounded-full" style={{ background: step.color }} />}
                </Link>
                {i < workflowSteps.length - 1 && (
                  <ChevronRight size={10} className="text-[#2d3748] mx-0.5 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 ml-4 shrink-0">
          {/* Impact summary */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1 rounded-lg bg-[#1a1f2e] border border-[#2d3748] text-[10px]">
            <span className="flex items-center gap-1"><span className="text-[#00d4aa] font-bold">⚡ {impact.peakReduced}%</span><span className="text-[#64748b]">peak↓</span></span>
            <span className="w-px h-3 bg-[#2d3748]" />
            <span className="flex items-center gap-1"><span className="text-[#10b981] font-bold">₹{impact.capexSaved}L</span><span className="text-[#64748b]">saved</span></span>
            <span className="w-px h-3 bg-[#2d3748]" />
            <span className="flex items-center gap-1"><span className="text-[#6366f1] font-bold">{impact.transformersSaved}</span><span className="text-[#64748b]">DTRs</span></span>
            <span className="w-px h-3 bg-[#2d3748]" />
            <span className="flex items-center gap-1"><span className="text-[#f59e0b] font-bold">{impact.userSatisfaction}%</span><span className="text-[#64748b]">sat.</span></span>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center rounded-lg border border-[#2d3748] overflow-hidden text-[10px] font-semibold">
            <button onClick={() => setMode("live")}
              className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${mode === "live" ? "bg-[#10b981]/20 text-[#10b981]" : "text-[#64748b] hover:text-white"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${mode === "live" ? "bg-[#10b981] animate-pulse" : "bg-[#64748b]"}`} />
              LIVE
            </button>
            <button onClick={() => setMode("simulation")}
              className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${mode === "simulation" ? "bg-[#6366f1]/20 text-[#6366f1]" : "text-[#64748b] hover:text-white"}`}>
              <Monitor size={10} />
              SIM
            </button>
          </div>

          {/* Walkthrough button */}
          {!walkthroughActive && (
            <button onClick={handleWalkthroughStart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366f1] text-white text-[11px] font-semibold hover:bg-[#4f46e5] transition-colors">
              <Play size={10} />
              Run Scenario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
