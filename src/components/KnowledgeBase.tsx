"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileText, Trash2, Loader2, Library, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  chunkCount: number;
  uploadedAt: string;
}

export function KnowledgeBase() {
  const [docs, setDocs] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/docs");
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (e) {
      console.error("Failed to fetch documents", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      toast.error("Format Mismatch", { description: "Only PDF and TXT files are permitted in your knowledge cluster." });
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Indexing Knowledge...", { description: `Processing ${file.name}` });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ingestion failed");
      toast.success("Ingestion Complete", { id: toastId, description: `${file.name} is now queryable.` });
      fetchDocs();
    } catch (err) {
      toast.error("Encoding Error", { id: toastId, description: "System was unable to vectorize document nodes." });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const toastId = toast.loading("Purging Records...", { description: `Removing ${name}` });
    try {
      const res = await fetch(`/api/docs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocs(docs.filter((d) => d.id !== id));
        toast.success("Node Purged", { id: toastId, description: "Resource has been successfully decommissioned." });
      }
    } catch (e) {
      toast.error("Cleanup Failed", { id: toastId });
    }
  };

  const filteredDocs = docs.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const cardStyle = {
    background: "rgba(13,20,40,0.55)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(99,102,241,0.13)",
    borderRadius: "1.5rem",
  };

  return (
    <div
      className="h-full py-16 px-10 overflow-y-auto transition-colors"
      style={{ background: "linear-gradient(160deg, #020617 0%, #020d1f 50%, #020617 100%)" }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.4) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-400 mb-2">
              <Library size={24} strokeWidth={2.5} />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Module: 02</h2>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">Knowledge Base</h1>
            <p className="text-sm font-medium max-w-sm" style={{ color: "#94a3b8" }}>
              Manage the information blocks used to train your specialized AI support models.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="pl-11 pr-5 py-3 rounded-2xl focus:outline-none text-sm font-medium w-64"
                style={{
                  background: "rgba(13,20,40,0.7)",
                  border: "1px solid rgba(99,102,241,0.18)",
                  color: "#e2e8f0",
                  caretColor: "#a5b4fc",
                  backdropFilter: "blur(16px)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.18)"; }}
              />
            </div>
            <button
              className="p-3 rounded-2xl text-slate-400 hover:text-indigo-400 transition-all"
              style={{ background: "rgba(13,20,40,0.7)", border: "1px solid rgba(99,102,241,0.15)" }}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Upload Terminal */}
        <label
          className="group relative flex flex-col items-center justify-center p-12 py-16 rounded-[2.5rem] cursor-pointer transition-all duration-500"
          style={{
            background: "rgba(13,20,40,0.45)",
            border: "2px dashed rgba(99,102,241,0.25)",
            backdropFilter: "blur(16px)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.6)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.25)"; }}
        >
          <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} disabled={isUploading} className="hidden" />

          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-indigo-400 relative"
                    style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(99,102,241,0.3)" }}>
                    <Loader2 size={40} className="animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-indigo-400 animate-pulse">Encoding Node...</h3>
                  <p className="text-xs font-bold text-indigo-500/60 uppercase tracking-widest">Constructing Knowledge Graph</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-white transition-all duration-500"
                  style={{ background: "rgba(79,70,229,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(79,70,229,0.85)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(79,70,229,0.1)"; }}
                >
                  <UploadCloud size={40} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Ingest Information Hub</h3>
                  <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                    Drag PDF or Text files to expand your AI's specialized context.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </label>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                className="group relative p-6 transition-all duration-300"
                style={cardStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(99,102,241,0.40)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(79,70,229,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(99,102,241,0.13)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div
                    className={cn("p-4 rounded-2xl")}
                    style={
                      doc.type.includes("pdf")
                        ? { background: "rgba(239,68,68,0.12)", color: "#f87171" }
                        : { background: "rgba(59,130,246,0.12)", color: "#60a5fa" }
                    }
                  >
                    <FileText size={24} />
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="p-2 rounded-xl transition-all text-slate-600 hover:text-red-400"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[15px] font-black text-white truncate" title={doc.name}>{doc.name}</h4>
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(99,102,241,0.10)" }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Ready Cluster</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{doc.chunkCount} Vector Nodes</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredDocs.length === 0 && !isUploading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center" style={{ opacity: 0.3 }}>
              <div className="p-10 rounded-full mb-6" style={{ border: "2px dashed rgba(99,102,241,0.3)" }}>
                <Search size={48} strokeWidth={1} className="text-slate-500" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500">No resources found in current cluster</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
