import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PomodoroTimer } from "@/components/PomodoroTimer";

export const Route = createFileRoute("/pomodoro")({
  head: () => ({ meta: [{ title: "Pomodoro Tech — StudiOS" }] }),
  component: PomodoroPage,
});

function PomodoroPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 lg:mb-14 pl-12 lg:pl-0">
        <p className="text-[11px] uppercase tracking-[0.4em] text-primary-glow mb-2">Cadenced Sprints</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
          Pomodoro <span className="text-gradient">Tech</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">25 / 5 / 15 — the rhythm of relentless focus.</p>
      </header>
      <div className="py-6">
        <PomodoroTimer />
      </div>
    </motion.div>
  );
}
