import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square } from "lucide-react";
import { logSession, setStatus } from "@/lib/store";
import { toast } from "sonner";

function fmt(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export function FocusTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const start = () => { setRunning(true); setStatus("studying"); };
  const pause = () => { setRunning(false); setStatus("break"); };
  const stop = async () => {
    setRunning(false);
    if (seconds >= 10) {
      const pts = await logSession(seconds, "focus");
      toast.success(`Session saved · +${pts} points`);
    }
    setSeconds(0);
    setStatus("idle");
  };

  return (
    <div className="relative grid place-items-center">
      <motion.div
        animate={running ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 3, repeat: running ? Infinity : 0, ease: "easeInOut" }}
        className={`w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full glass-strong grid place-items-center
          ${running ? "pulse-glow" : ""}`}
      >
        <div className="absolute inset-6 rounded-full border border-glass-border" />
        <div className="absolute inset-12 rounded-full border border-glass-border opacity-50" />
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground mb-3">
            {running ? "Deep Work" : seconds > 0 ? "Paused" : "Ready"}
          </p>
          <p className="font-mono text-5xl sm:text-7xl font-light text-gradient tabular-nums">
            {fmt(seconds)}
          </p>
        </div>
      </motion.div>

      <div className="mt-10 flex items-center gap-3">
        {!running ? (
          <button onClick={start} className="glass-strong px-6 py-3 rounded-2xl flex items-center gap-2 hover:glow-primary transition-all">
            <Play className="w-4 h-4 fill-current" /> <span className="text-sm font-medium">Start</span>
          </button>
        ) : (
          <button onClick={pause} className="glass-strong px-6 py-3 rounded-2xl flex items-center gap-2">
            <Pause className="w-4 h-4 fill-current" /> <span className="text-sm font-medium">Pause</span>
          </button>
        )}
        <button onClick={stop} disabled={seconds === 0}
          className="glass px-6 py-3 rounded-2xl flex items-center gap-2 disabled:opacity-30">
          <Square className="w-4 h-4" /> <span className="text-sm font-medium">End & Save</span>
        </button>
      </div>
    </div>
  );
}
