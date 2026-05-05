"use client";
import { Brain, RefreshCw, AlertTriangle, Loader } from "lucide-react";

interface Props {
  title: string;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  onRefresh: () => void;
  children: React.ReactNode;
  color?: string;
}

export default function AIPanel({ title, loading, error, lastFetched, onRefresh, children, color = "#6366f1" }: Props) {
  return (
    <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3748]"
        style={{ background: `${color}08` }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
            <Brain size={12} style={{ color }} />
          </div>
          <span className="text-xs font-semibold text-white">{title}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${color}20`, color }}>AI</span>
        </div>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-[10px] text-[#64748b]">
              {lastFetched.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={onRefresh} disabled={loading}
            className="p-1 rounded hover:bg-[#2d3748] transition-colors disabled:opacity-40">
            {loading
              ? <Loader size={12} className="text-[#64748b] animate-spin" />
              : <RefreshCw size={12} className="text-[#64748b]" />}
          </button>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 mb-3">
            <AlertTriangle size={12} className="text-[#ef4444] shrink-0" />
            <span className="text-xs text-[#ef4444]">{error}</span>
          </div>
        )}
        {loading && !error ? (
          <div className="flex items-center justify-center py-8 gap-3">
            <Loader size={16} className="animate-spin" style={{ color }} />
            <span className="text-xs text-[#64748b]">Querying Groq LLM…</span>
          </div>
        ) : children}
      </div>
    </div>
  );
}
