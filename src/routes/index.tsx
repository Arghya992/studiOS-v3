import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FocusTimer } from "@/components/FocusTimer";
import { useStudiOS } from "@/lib/store";
import { 
  Trophy, Flame, Target, BrainCircuit, 
  Zap, Sparkles, Send, MessageSquareQuote, 
  Lock, ChevronRight 
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Focus Hub — StudiOS" }] }),
  component: FocusHub,
});

function fmtHours(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

function FocusHub() {
  const { totalPoints, totalFocusSeconds, rank } = useStudiOS();
  const [doubtText, setDoubtText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [eliteAnalysis, setEliteAnalysis] = useState<string | null>(null);

  // COST CONFIGURATION
  const DOUBT_COST = 30; 

  const handleEliteSolve = async () => {
    if (totalPoints < DOUBT_COST || !doubtText) return;

    setIsAnalyzing(true);

    // AI Simulation - Elite JEE/NEET Mentor logic
    setTimeout(() => {
      setEliteAnalysis(
        "ANALYSIS: Rotational Dynamics - Moment of Inertia.\n\n" +
        "ELITE SHORTCUT: Use the Parallel Axis Theorem, but remember the 'd' is the distance between the two parallel axes, not from the origin.\n\n" +
        "TRAP: In NEET, they often ask for the 'Radius of Gyration' (k) instead of 'I'. Always remember I = Mk² to avoid that final-step error."
      );
      setIsAnalyzing(false);
      // Integration Point: useStudiOS().subtractPoints(DOUBT_COST);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto pb-20">
      <header className="mb-10 lg:mb-14 pl-12 lg:pl-0">
        <p className="text-[11px] uppercase tracking-[0.4em] text-primary-glow mb-2">Deep Work Command Center</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
          Focus <span className="text-gradient">Hub</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">1 Hour Study = 100 XP. Use your mastery to break roadblocks.</p>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <StatCard icon={Trophy} label="Current Rank" value={rank.name} accent />
        <StatCard icon={Flame} label="Total Points" value={totalPoints.toLocaleString()} />
        <StatCard icon={Target} label="Focus Time" value={fmtHours(totalFocusSeconds)} />
      </div>

      {/* Timer Section */}
      <div className="py-6 mb-12">
        <FocusTimer />
      </div>

      {/* --- ELITE DOUBT SOLVER (Optimized to 30 XP) --- */}
      <section className="glass rounded-[2.5rem] p-8 lg:p-12 border border-white/5 relative overflow-hidden shadow-2xl max-w-4xl mx-auto">
        <div className="absolute top-0 right-0 p-10 opacity-5 -z-10">
          <BrainCircuit size={160} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tight uppercase">
                Elite <span className="text-gradient">Doubt Solver</span>
              </h3>
              <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase opacity-70">
                Deployment Cost: {DOUBT_COST} Mastery Points
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            totalPoints >= DOUBT_COST ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {totalPoints >= DOUBT_COST ? <Zap size={14} className="animate-pulse" /> : <Lock size={14} />}
            <span className="text-[11px] font-black uppercase tracking-widest">
              {totalPoints >= DOUBT_COST ? "Insight Available" : `${DOUBT_COST - totalPoints} XP Needed`}
            </span>
          </div>
        </div>

        <div className="relative">
          <textarea 
            value={doubtText}
            onChange={(e) => setDoubtText(e.target.value)}
            placeholder="What's blocking your rank today? AI will provide shortcuts and traps."
            className="w-full h-32 glass border border-white/10 rounded-3xl p-6 text-sm focus:border-primary/50 outline-none resize-none transition-all placeholder:opacity-30 font-medium"
          />
          
          <button 
            disabled={totalPoints < DOUBT_COST || !doubtText || isAnalyzing}
            onClick={handleEliteSolve}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-20 disabled:grayscale"
          >
            {isAnalyzing ? "Calculating..." : "Redeem Insight"}
            <ChevronRight size={16} />
          </button>
        </div>

        <AnimatePresence>
          {eliteAnalysis && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2rem] relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                  <MessageSquareQuote size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Elite Strategic Output</span>
                </div>
                <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest">30 XP Consumed</div>
              </div>
              
              <div className="space-y-6">
                <p className="text-[14px] leading-relaxed text-white/90 font-mono whitespace-pre-wrap">
                  {eliteAnalysis}
                </p>
                <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4">
                   <span className="text-[9px] font-black text-primary/40 bg-primary/5 px-2 py-1 rounded border border-primary/10 uppercase tracking-widest">#JEE_NEET_EDGE</span>
                   <span className="text-[9px] font-black text-primary/40 bg-primary/5 px-2 py-1 rounded border border-primary/10 uppercase tracking-widest">#DERIVATION_UNLOCKED</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-5 flex items-center gap-4 transition-all hover:scale-[1.02] ${accent ? "border-primary-glow/40 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" : "border-white/5"}`}>
      <div className={`w-11 h-11 rounded-xl grid place-items-center ${accent ? "bg-gradient-to-br from-primary to-primary-glow glow-primary" : "bg-white/5 text-muted-foreground"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">{label}</p>
        <p className="text-xl font-bold mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  );
}