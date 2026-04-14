"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Chat } from "@/components/chat";
import { Dashboard } from "@/components/Dashboard";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export default function Home() {
  const [currentView, setCurrentView] = useState<"dashboard" | "chat" | "knowledge" | "analytics" | "settings">("dashboard");

  return (
    <div className="flex h-screen w-full mesh-background overflow-hidden leading-relaxed text-foreground font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar - Professional SaaS Navigation */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        className="hidden md:flex w-[280px] transition-all duration-300 ease-in-out border-r border-indigo-500/10 z-20" 
      />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <div className="flex-1 relative overflow-hidden">
          {currentView === "dashboard" && <Dashboard onStartChat={() => setCurrentView("chat")} />}
          {currentView === "chat" && <Chat />}
          {currentView === "knowledge" && <KnowledgeBase />}
          
          {(currentView === "analytics" || currentView === "settings") && (
            <div className="flex flex-col items-center justify-center h-full text-center p-10 mesh-bg">
              <div
                className="p-10 rounded-[3rem] backdrop-blur-3xl"
                style={{ background: "rgba(13,20,40,0.65)", border: "1px solid rgba(99,102,241,0.18)" }}
              >
                <h2 className="text-3xl font-black text-gradient uppercase tracking-tighter mb-4">Coming Soon</h2>
                <p className="text-sm font-medium max-w-sm mx-auto" style={{ color: "#94a3b8" }}>
                  The {currentView} module is being prepared for your enterprise deployment.
                  Stay tuned for advanced AI orchestration features.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
