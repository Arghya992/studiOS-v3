import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Zap, Plus, Hash, ArrowRight, Sparkles, ShieldCheck, Info } from "lucide-react";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  status: "studying" | "break" | "idle";
  status_started_at: string | null;
  total_focus_seconds: number;
};

type Totem = {
  id: string;
  emoji: string;
  label: string;
  description: string;
};

const TOTEMS: Totem[] = [
  { id: "owl", emoji: "🦉", label: "Zen Owl", description: "Deep Theory & Logic" },
  { id: "wolf", emoji: "🐺", label: "Blitz Wolf", description: "Fast MCQ Sprints" },
  { id: "lion", emoji: "🦁", label: "Apex Lion", description: "Engineering Marathons" },
];

export const Route = createFileRoute("/tracker")({
  head: () => ({ meta: [{ title: "Aura Sanctuary — StudiOS" }] }),
  component: TrackerPage,
});

function fmt(secs: number) {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function TrackerPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [selectedTotem, setSelectedTotem] = useState<string>("owl");
  const [callsign, setCallsign] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    let mounted = true;
    const loadMembers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,display_name,avatar_url,status,status_started_at,total_focus_seconds")
        .order("status", { ascending: true });
      if (!mounted) return;
      setProfiles((data ?? []) as Profile[]);
    };
    loadMembers();
    const channel = supabase
      .channel(`room-${activeRoom}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadMembers)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [activeRoom]);

  const handleJoin = () => roomCode.length > 3 && setActiveRoom(roomCode.toUpperCase());
  const handleCreate = () => setActiveRoom(Math.random().toString(36).substring(2, 7).toUpperCase());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-20 px-6">
      <AnimatePresence mode="wait">
        {!activeRoom ? (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10"
          >
            {/* LEFT: TOTEM SELECTION (Identity) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass rounded-[3rem] p-8 border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="text-primary" size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/70">Initialize Identity</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {TOTEMS.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTotem(t.id)}
                      className={`group flex flex-col items-center p-5 rounded-3xl border-2 transition-all relative ${
                        selectedTotem === t.id 
                        ? 'border-primary bg-primary/10 shadow-[0_0_25px_rgba(var(--primary-rgb),0.25)] scale-105' 
                        : 'border-transparent glass opacity-40 hover:opacity-100'
                      }`}
                    >
                      <motion.span 
                        animate={selectedTotem === t.id ? { y: [0, -8, 0] } : {}}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-4xl mb-3"
                      >
                        {t.emoji}
                      </motion.span>
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-2">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase ml-2">Display Callsign</p>
                  <input 
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder="e.g. Arghya_VIT"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-primary transition-all text-white"
                  />
                </div>
              </div>

              {/* AURA LEGEND (Fills space & Adds context) */}
              <div className="glass rounded-[2.5rem] p-8 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-2 mb-6">
                  <Info size={16} className="text-primary" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-white/50">Sanctuary Legend</h4>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(var(--primary-rgb),0.8)]" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">Steady Pulse: Deep Focus Mode Active</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">Dimmed State: Recharging / On Break</p>
                  </div>
                  <div className="flex items-center gap-4 text-primary">
                    <Zap size={14} className="animate-bounce" />
                    <p className="text-[10px] font-bold uppercase leading-tight">Zap Pulse: Peer Encouragement Received</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: THE GATEWAY (Action) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="glass rounded-[4rem] p-16 border border-white/5 text-center space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] -z-10" />
                
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.6em] text-primary font-bold">Social Productivity Engine</p>
                  <h2 className="text-7xl font-black italic tracking-tighter leading-none">AURA <span className="text-gradient">SANCTUARY</span></h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto italic opacity-70">
                    Your focus is yours, but the energy is shared. Enter the sanctuary to grind with your tribe.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-6">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
                      <input 
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="ROOM CODE"
                        className="w-full glass border border-white/10 rounded-3xl py-5 pl-14 pr-6 font-black tracking-[0.4em] outline-none focus:border-primary text-xl"
                      />
                    </div>
                    <button 
                      onClick={handleJoin}
                      className="bg-primary px-8 rounded-3xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/30"
                    >
                      <ArrowRight size={28} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6 opacity-30">
                    <hr className="flex-1 border-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest">or</span>
                    <hr className="flex-1 border-white" />
                  </div>

                  <button 
                    onClick={handleCreate}
                    className="w-full py-5 glass border border-white/10 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95"
                  >
                    Initialize New Sanctuary
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* --- ACTIVE ROOM VIEW --- */
          <motion.div key="room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <header className="text-center space-y-2">
               <div className="inline-flex items-center gap-2 px-4 py-1 glass rounded-full border border-primary/20 text-[10px] font-black uppercase text-primary tracking-widest animate-pulse">
                 <div className="w-2 h-2 bg-primary rounded-full" /> Live Synchronization
               </div>
               <h2 className="text-5xl font-black italic tracking-tighter">SANCTUARY: <span className="text-gradient">{activeRoom}</span></h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tick={tick}>
              {profiles.map((p, i) => {
                const started = p.status_started_at ? new Date(p.status_started_at).getTime() : 0;
                const elapsed = started ? Math.floor((Date.now() - started) / 1000) : 0;
                const isStudying = p.status === "studying";
                
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass rounded-[2.5rem] p-8 border transition-all relative group ${
                      isStudying ? 'border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]' : 'border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`relative w-20 h-20 rounded-full grid place-items-center text-4xl border-2 transition-all ${
                        isStudying ? 'border-primary animate-pulse shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]' : 'border-white/10'
                      }`}>
                        {TOTEMS[i % 3].emoji}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-black text-lg truncate tracking-tight">{p.display_name ?? "Anonymous"}</h4>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${isStudying ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),1)]' : 'bg-muted-foreground'}`} />
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{p.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Focus Duration</p>
                        <p className="font-mono text-3xl font-black text-gradient tabular-nums">{p.status === "idle" ? "--:--:--" : fmt(elapsed)}</p>
                      </div>
                      <button className="h-12 w-12 glass rounded-2xl grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all active:scale-90">
                         <Zap size={20} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center pt-10">
              <button 
                onClick={() => setActiveRoom(null)}
                className="px-10 py-4 glass border border-red-500/20 text-red-500 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-500/10 transition-all"
              >
                Exit Sanctuary
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}