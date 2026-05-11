import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { logSession } from "@/lib/store";
import { toast } from "sonner";

type Mode = "work" | "short" | "long";
const DURATIONS: Record<Mode, number> = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const LABELS: Record<Mode, string> = { work: "Focus", short: "Short Break", long: "Long Break" };

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [remaining, setRemaining] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => { setRemaining(DURATIONS[mode]); setRunning(false); }, [mode]);

  useEffect(() => {
    if (running && remaining > 0) {
      ref.current = window.setInterval(() => setRemaining((r) => r - 1), 1000);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      if (mode === "work") {
        logSession(DURATIONS.work, "pomodoro").then((p) => toast.success(`Pomodoro done · +${p} pts`));
      } else {
        toast("Break complete");
      }
    }
  }, [remaining, running, mode]);

  const total = DURATIONS[mode];
  const progress = useMemo(() => 1 - remaining / total, [remaining, total]);
  const C = 2 * Math.PI * 140;

  return (
    <div className="flex flex-col items-center">
      {/* Mode tabs */}
      <div className="glass rounded-2xl p-1.5 flex gap-1 mb-10">
        {(Object.keys(DURATIONS) as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`relative px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors
              ${mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {mode === m && (
              <motion.div layoutId="pomo-tab" className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/40 to-primary-glow/20 border border-primary-glow/30" />
            )}
            <span className="relative">{LABELS[m]}</span>
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="140" stroke="oklch(1 0 0 / 0.06)" strokeWidth="14" fill="none" />
          <motion.circle
            cx="160" cy="160" r="140" fill="none" strokeWidth="14" strokeLinecap="round"
            stroke="url(#g1)"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - progress) }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 12px oklch(0.7 0.22 290 / 0.6))" }}
          />
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.24 280)" />
              <stop offset="100%" stopColor="oklch(0.78 0.2 305)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground mb-2">{LABELS[mode]}</p>
            <p className="font-mono text-6xl sm:text-7xl font-light text-gradient tabular-nums">{fmt(remaining)}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <button onClick={() => setRunning((v) => !v)}
          className="glass-strong px-7 py-3 rounded-2xl flex items-center gap-2 hover:glow-primary transition-all">
          {running ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span className="text-sm font-medium">{running ? "Pause" : "Start"}</span>
        </button>
        <button onClick={() => { setRemaining(DURATIONS[mode]); setRunning(false); }}
          className="glass px-5 py-3 rounded-2xl flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
