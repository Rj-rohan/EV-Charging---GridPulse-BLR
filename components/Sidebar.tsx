"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, CalendarClock, MapPin, GitBranch,
  Zap, Activity, ShieldAlert, IndianRupee, Users, FlaskConical,
  Network, Plug, SlidersHorizontal, Smartphone, Wrench, ScanSearch,
  FileText, X, Menu
} from "lucide-react";

const nav = [
  { href: "/",               label: "Dashboard",        icon: LayoutDashboard },
  { href: "/operations",     label: "Grid Operations",  icon: ShieldAlert,       badge: "LIVE" },
  { href: "/forecasting",    label: "Forecasting",      icon: TrendingUp },
  { href: "/scheduling",     label: "Scheduling",       icon: CalendarClock },
  { href: "/tariff",         label: "Tariff Engine",    icon: IndianRupee },
  { href: "/behavior",       label: "User Behavior",    icon: Users },
  { href: "/explainability", label: "Explainability",   icon: FlaskConical },
  { href: "/federation",     label: "Federated Control",icon: Network },
  { href: "/integration",    label: "SCADA Integration",icon: Plug },
  { href: "/what-if",        label: "Scenario Planner", icon: SlidersHorizontal },
  { href: "/consumer",       label: "Consumer View",    icon: Smartphone },
  { href: "/capex",          label: "Asset Upgrade",    icon: Wrench },
  { href: "/anomaly",        label: "Anomaly Detection",icon: ScanSearch },
  { href: "/siting",         label: "Siting Engine",    icon: MapPin },
  { href: "/digital-twin",   label: "Digital Twin",     icon: GitBranch },
  { href: "/ab-test",        label: "A/B Testing",      icon: FlaskConical },
  { href: "/report",         label: "Report Generator", icon: FileText },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const path = usePathname();
  return (
    <>
      <div className="p-5 border-b border-[#2d3748]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00d4aa] flex items-center justify-center">
              <Zap size={16} className="text-[#0f1117]" />
            </div>
            <div>
              <span className="font-bold text-base text-white">GridPulse BLR</span>
              <p className="text-xs text-[#64748b]">BESCOM EV Intelligence</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-[#64748b] hover:text-white md:hidden">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/20">
          <Activity size={12} className="text-[#00d4aa]" />
          <span className="text-xs text-[#00d4aa]">Live · 3 Sub-Divisions</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, badge }: { href: string; label: string; icon: React.ElementType; badge?: string }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30"
                  : "text-[#94a3b8] hover:bg-[#2d3748] hover:text-white"
              }`}>
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#ef4444] text-white animate-pulse">{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2d3748]">
        <div className="text-xs text-[#64748b] space-y-1">
          <div className="flex justify-between"><span>Theme 9</span><span className="text-[#00d4aa]">AI/EV</span></div>
          <div className="flex justify-between"><span>BESCOM</span><span>Bengaluru</span></div>
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger — shown in TopBar via prop, but also as fallback */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-2 left-2 z-50 p-2 rounded-lg bg-[#1a1f2e] border border-[#2d3748] text-[#94a3b8]"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-[#1a1f2e] border-r border-[#2d3748] flex flex-col h-full z-10">
            <NavContent onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-[#1a1f2e] border-r border-[#2d3748] flex-col z-50">
        <NavContent />
      </aside>
    </>
  );
}
