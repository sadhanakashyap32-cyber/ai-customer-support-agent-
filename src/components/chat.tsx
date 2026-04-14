"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Sparkles, Loader2, Trash2, Library, Activity, Download, Copy, Check, MessageSquareOff, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    sources?: string[];
    debug?: {
      retrievalTime: number;
      totalTime: number;
    }
  };
}

const SUGGESTED_QUESTIONS = [
  "Summarize the key policy highlights.",
  "Which dates are most critical?",
  "List the core requirements mentioned.",
  "What contact information is available?",
];

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) throw new Error("Connection failed");
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        metadata: data.metadata,
      }]);
    } catch (error) {
      toast.error("Network Latency Identified", { description: "System encountered an error processing your query." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (messages.length === 0) return;
    setMessages([]);
    toast.info("Session Purged", { description: "Context buffer has been successfully reset." });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SkeletonMessage = () => (
    <div className="flex max-w-4xl mx-auto items-start gap-4 justify-start">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 mt-1 animate-pulse-subtle"
        style={{ background: "rgba(79,70,229,0.12)" }}>
        <Sparkles size={18} />
      </div>
      <div className="w-full max-w-[500px] flex flex-col gap-3">
        <div className="h-4 w-3/4 rounded-lg animate-pulse-subtle" style={{ background: "rgba(99,102,241,0.12)" }} />
        <div className="h-4 w-full rounded-lg animate-pulse-subtle" style={{ background: "rgba(99,102,241,0.09)" }} />
        <div className="h-4 w-1/2 rounded-lg animate-pulse-subtle" style={{ background: "rgba(99,102,241,0.07)" }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full mesh-bg relative" style={{ userSelect: "none" }}>
      
      {/* Dynamic Header */}
      <header className="px-8 py-4 flex items-center justify-between sticky top-0 z-20 transition-all"
        style={{ background: "rgba(8,12,28,0.8)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Operational Cluster</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
             <button 
               onClick={handleClear}
               className="p-3 rounded-2xl transition-all"
               style={{ color: "#94a3b8" }}
               title="Clear Session"
               onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
               onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
             >
               <Trash2 size={16} />
             </button>
             <button
               className="px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all"
               style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc" }}
             >
               Enterprise Export
             </button>
         </div>
      </header>

      {/* Message Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-12 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-20"
            >
               <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 shadow-2xl shadow-indigo-500/10">
                  <Zap size={40} strokeWidth={1.5} />
               </div>
               <h3 className="text-3xl font-black tracking-tighter text-white mb-4">Initialize Intelligence</h3>
               <p className="font-medium mb-12 leading-relaxed" style={{ color: "#cbd5e1" }}>
                  Your specialized AI engine is online. Ask me questions based on your uploaded knowledge base nodes to receive hyper-accurate, context-enforced answers.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="p-5 text-left rounded-[1.5rem] group transition-all duration-300"
                      style={{ background: "rgba(13,20,40,0.65)", border: "1px solid rgba(99,102,241,0.15)", backdropFilter: "blur(16px)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.5)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.15)"; }}
                    >
                       <p className="text-[13px] font-semibold transition-colors" style={{ color: "#cbd5e1" }}>{q}</p>
                    </button>
                  ))}
               </div>
            </motion.div>
          ) : (
            messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex max-w-4xl mx-auto items-start gap-4",
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-lg transition-all"
                  style={m.role === "assistant"
                    ? { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", boxShadow: "0 4px 20px rgba(79,70,229,0.35)" }
                    : { background: "rgba(15,23,42,0.8)", color: "#94a3b8", border: "1px solid rgba(99,102,241,0.15)" }
                  }>
                  {m.role === "assistant" ? <Bot size={20} strokeWidth={2.5} /> : <User size={20} strokeWidth={2.5} />}
                </div>

                <div className={cn(
                  "flex flex-col gap-2 relative max-w-[85%]",
                  m.role === "user" ? "items-end" : "items-start"
                )}>
                  <div
                    className="px-7 py-5 transition-all duration-500"
                    style={m.role === "user"
                      ? { background: "rgba(79,70,229,0.9)", color: "#fff", borderRadius: "2rem 2rem 0.5rem 2rem", boxShadow: "0 10px 40px rgba(79,70,229,0.25)" }
                      : { background: "rgba(13,20,40,0.72)", color: "#e2e8f0", borderRadius: "0.5rem 2rem 2rem 2rem", border: "1px solid rgba(99,102,241,0.14)", backdropFilter: "blur(20px)" }
                    }>
                    {m.role === "assistant" && (
                       <div className="text-[9px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: "#a5b4fc" }}>AI Node Insight</div>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] font-medium leading-relaxed [&_*]:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>

                    {/* Sources Section */}
                    {m.metadata?.sources && m.metadata.sources.length > 0 && (
                      <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#94a3b8" }}>
                           <Library size={12} /> Reference Cluster ({m.metadata.sources.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {m.metadata.sources.map((s, i) => (
                             <span key={i} className="px-3 py-1.5 rounded-full text-[10px] font-bold"
                               style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                               {s}
                             </span>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={cn("hidden group-hover:flex items-center gap-2 mt-1 px-4 cursor-pointer")}>
                     <button onClick={() => handleCopy(m.id, m.content)} className="p-1.5 text-zinc-400 hover:text-indigo-500 transition-colors">
                        {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}
                     </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          
          {isLoading && <SkeletonMessage />}
        </AnimatePresence>
      </div>

      <div className="p-8 mx-auto w-full max-w-4xl sticky bottom-0" style={{ background: "linear-gradient(to top, #020617 60%, transparent)" }}>
        <form onSubmit={handleSubmit} className="relative flex items-center rounded-[2.5rem] transition-all duration-300"
          style={{ background: "rgba(13,20,40,0.80)", border: "1px solid rgba(99,102,241,0.18)", backdropFilter: "blur(24px)" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Search Cluster Node Parameters..."
            className="w-full max-h-40 min-h-[72px] py-6 pl-8 pr-20 bg-transparent resize-none outline-none text-[15px] font-medium"
            style={{ color: "#e2e8f0", caretColor: "#a5b4fc" }}
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-4 p-4 rounded-3xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 translate-y-[1px]"
          >
            <Sparkles size={20} />
          </button>
        </form>
        <div className="text-center mt-4">
           <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#64748b" }}>
              Context Injected Intelligence Layer <span className="mx-2" style={{ color: "#818cf8" }}>•</span> Secure Tunnel Encrypted
           </span>
        </div>
      </div>
    </div>
  );
}
