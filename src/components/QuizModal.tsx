import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle } from "lucide-react";
import { addPoints } from "@/lib/store";
import { toast } from "sonner";

export type Question = { q: string; choices: string[]; answer: number };
export type Quiz = { id: string; title: string; questions: Question[] };

export function QuizModal({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  const q = quiz.questions[idx];

  function pick(i: number) {
    if (feedback) return;
    const correct = i === q.answer;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      if (idx + 1 >= quiz.questions.length) {
        setDone(true);
        const earned = (correct ? score + 1 : score) * 10;
        addPoints(earned);
        toast.success(`Quiz complete · +${earned} pts`);
      } else {
        setIdx((n) => n + 1);
      }
    }, 700);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl glass-strong rounded-3xl p-8 transition-all
          ${feedback === "correct" ? "shadow-[0_0_60px_oklch(0.72_0.18_150_/_0.45)]" : ""}
          ${feedback === "wrong" ? "shake shadow-[0_0_60px_oklch(0.62_0.24_22_/_0.45)]" : ""}`}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        {!done ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary-glow">{quiz.title}</p>
                <p className="text-2xl font-semibold mt-1">{score}<span className="text-muted-foreground text-base">/{quiz.questions.length}</span></p>
              </div>
              <div className="font-mono text-sm text-muted-foreground tabular-nums glass px-3 py-1.5 rounded-lg">
                {Math.floor(time / 60).toString().padStart(2,"0")}:{(time % 60).toString().padStart(2,"0")}
              </div>
            </div>

            {/* Progress */}
            <div className="h-1 rounded-full bg-glass mb-8 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-primary to-primary-glow"
                animate={{ width: `${((idx) / quiz.questions.length) * 100}%` }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <h3 className="text-xl sm:text-2xl font-medium mb-6 leading-snug">{q.q}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {q.choices.map((c, i) => {
                    const isCorrect = feedback && i === q.answer;
                    return (
                      <button key={i} onClick={() => pick(i)} disabled={!!feedback}
                        className={`text-left glass rounded-2xl p-4 transition-all hover:bg-glass hover:border-primary-glow/40
                          ${isCorrect ? "border-success/60 bg-success/10" : ""}`}>
                        <span className="text-sm">{c}</span>
                        {isCorrect && <Check className="w-4 h-4 inline ml-2 text-success" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-6 glass-strong glow-primary">
              {score === quiz.questions.length ? <Check className="w-8 h-8 text-success" /> : <AlertCircle className="w-8 h-8 text-primary-glow" />}
            </div>
            <h3 className="text-3xl font-semibold text-gradient mb-2">{score} / {quiz.questions.length}</h3>
            <p className="text-muted-foreground mb-6">+{score * 10} points earned</p>
            <button onClick={onClose} className="glass-strong px-6 py-3 rounded-2xl text-sm font-medium hover:glow-primary">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
