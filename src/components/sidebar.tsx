"use client";

import { LayoutDashboard, MessageSquare, Library, BarChart3, Settings, ShieldCheck, ChevronRight, LogOut, Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  currentView: "dashboard" | "chat" | "knowledge" | "analytics" | "settings";
  onViewChange: (view: any) => void;
}

export function Sidebar({ className, currentView, onViewChange }: SidebarProps) {
  const MENU_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "chat", label: "Conversations", icon: <MessageSquare size={20} /> },
    { id: "knowledge", label: "Knowledge Base", icon: <Library size={20} /> },
  ];

  const SECONDARY_ITEMS = [
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div
      className={cn("flex flex-col h-full p-6 shrink-0 relative transition-all duration-500", className)}
      style={{
        background: "rgba(8, 12, 28, 0.75)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderRight: "1px solid rgba(99,102,241,0.12)",
      }}
    >

      {/* Brand */}
      <div className="flex items-center gap-3.5 px-2 mb-12">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
          <ShieldCheck size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tighter text-white leading-none">Antigravity</h2>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.25em] mt-1.5 block opacity-80">Knowledge Engine</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-10 px-1">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          disabled
          placeholder="Global Search..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-bold outline-none cursor-not-allowed opacity-40 text-slate-300"
          style={{
            background: "rgba(99,102,241,0.07)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        />
      </div>

      {/* Primary Nav */}
      <nav className="space-y-1.5 flex-1">
        <div className="px-3 mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#64748b" }}>Platform</span>
        </div>

        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden"
            style={
              currentView === item.id
                ? { background: "rgba(79,70,229,0.9)", color: "#fff", boxShadow: "0 8px 32px rgba(79,70,229,0.35)" }
                : { color: "#94a3b8" }
            }
            onMouseEnter={(e) => {
              if (currentView !== item.id) {
                (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.10)";
                (e.currentTarget as HTMLElement).style.color = "#a5b4fc";
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== item.id) {
                (e.currentTarget as HTMLElement).style.background = "";
                (e.currentTarget as HTMLElement).style.color = "#94a3b8";
              }
            }}
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <span className={cn("transition-transform", currentView === item.id ? "scale-110" : "group-hover:scale-110")}>
                {item.icon}
              </span>
              <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
            </div>
            {currentView === item.id ? (
              <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-2xl bg-indigo-600 z-0" />
            ) : (
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-all -translate-x-2 group-hover:translate-x-0" />
            )}
          </button>
        ))}

        <div className="px-3 pt-10 mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#64748b" }}>Secondary</span>
        </div>

        {SECONDARY_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group"
            style={{ color: currentView === item.id ? "#a5b4fc" : "#64748b" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.09)";
              (e.currentTarget as HTMLElement).style.color = "#a5b4fc";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "";
              (e.currentTarget as HTMLElement).style.color = currentView === item.id ? "#a5b4fc" : "#64748b";
            }}
          >
            <div className="flex items-center gap-3.5">
              <span>{item.icon}</span>
              <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30" />
          </button>
        ))}
      </nav>

      {/* Bottom Profile */}
      <div className="mt-auto pt-8" style={{ borderTop: "1px solid rgba(99,102,241,0.12)" }}>
        <button className="w-full flex items-center gap-4 px-3 py-2 rounded-2xl transition-all group"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-indigo-400 text-xs font-black"
            style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}
          >
            AD
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-[13px] font-black text-slate-200 truncate w-full">Administrator</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Plan</span>
          </div>
          <LogOut size={16} className="ml-auto text-slate-600 group-hover:text-red-400 transition-colors" />
        </button>

        <div className="mt-6 p-4 rounded-[1.5rem] text-center"
          style={{ background: "rgba(79,70,229,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}
        >
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 block">System Status</span>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-subtle shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[11px] font-black text-slate-300">99.9% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
