"use client";

import { motion } from "framer-motion";
import { Activity, Zap, ShieldCheck, ArrowRight, Globe } from "lucide-react";

export function Dashboard({ onStartChat }: { onStartChat: () => void }) {
  return (
    <div className="h-full overflow-y-auto mesh-bg transition-colors duration-1000">
      <div className="max-w-6xl mx-auto px-10 pt-24 pb-20">

        {/* Hero */}
        <div className="flex flex-col items-center text-center space-y-10 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-xl"
            style={{
              background: "rgba(13,20,40,0.72)",
              border: "1px solid rgba(99,102,241,0.25)",
              boxShadow: "0 8px 32px rgba(79,70,229,0.12)",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-subtle" />
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">Next-Generation Support Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-[7rem] font-black text-white tracking-tighter leading-[0.85]"
            style={{ textShadow: "0 0 80px rgba(79,70,229,0.3)" }}
          >
            AI Customer Support <br />
            <span className="text-gradient">for Smart Businesses</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-medium max-w-2xl leading-relaxed"
            style={{ color: "#94a3b8" }}
          >
            Empower your customer success team with a specialized intelligence layer.
            Automate inquiries with hyper-accuracy using your own knowledge graphs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-6 pt-6"
          >
            <button
              onClick={onStartChat}
              className="group flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-500 active:scale-95 transition-all duration-300"
              style={{ boxShadow: "0 8px 40px rgba(79,70,229,0.40)" }}
            >
              Initialize Agent
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ border: "3px solid rgba(13,20,40,0.9)", background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  <div className="w-full h-full opacity-40 bg-gradient-to-br from-indigo-400 to-purple-500" />
                </div>
              ))}
              <div className="pl-6 flex flex-col items-start justify-center">
                <span className="text-xs font-black text-white">Active Deployments</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Operational 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-left">
          {[
            {
              title: "Hyper-Relational Indexing",
              desc: "Traditional search is stale. Antigravity uses semantic vector nodes to find exact answers in milliseconds.",
              icon: <Activity className="text-indigo-400" />,
            },
            {
              title: "Zero-Latency Intelligence",
              desc: "Powered by Gemini Pro 2.5, delivering enterprise-grade reasoning for your support tickets.",
              icon: <Zap className="text-purple-400" />,
            },
            {
              title: "Sovereign Knowledge",
              desc: "Your data stays yours. Our strictly-enforced context prevents hallucinations and leaks.",
              icon: <ShieldCheck className="text-cyan-400" />,
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-10 rounded-[2.5rem] group transition-all duration-300 cursor-default"
              style={{
                background: "rgba(13,20,40,0.55)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(99,102,241,0.13)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border = "1px solid rgba(99,102,241,0.35)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(79,70,229,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border = "1px solid rgba(99,102,241,0.13)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"
                style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(99,102,241,0.18)" }}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-4">{feature.title}</h3>
              <p className="text-sm leading-relaxed font-medium" style={{ color: "#94a3b8" }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <footer
          className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ borderTop: "1px solid rgba(99,102,241,0.12)" }}
        >
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: "#64748b" }}>
            <Globe size={14} /> Global Availability Cluster: US-WEST-1
          </div>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold" style={{ color: "#64748b" }}>Privacy Policy</span>
            <span className="text-[10px] font-bold" style={{ color: "#64748b" }}>Enterprise Agreement</span>
            <span className="text-[10px] font-bold text-indigo-400">v1.2 Stable</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
