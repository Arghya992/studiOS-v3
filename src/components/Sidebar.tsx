import { Link, useRouterState } from "@tanstack/react-router";
import { 
  Brain, 
  Timer, 
  Users, 
  Sparkles, 
  User as UserIcon, 
  Menu, 
  X, 
  FlaskConical // Added for the Study Lab icon
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudiOS } from "@/lib/store";
import { getRank } from "@/lib/store";

const items = [
  { to: "/", label: "Focus Hub", icon: Brain },
  { to: "/studylab", label: "AI Study Lab", icon: FlaskConical }, // New AI Study Lab Link
  { to: "/pomodoro", label: "Pomodoro Tech", icon: Timer },
  { to: "/tracker", label: "Yeolpumta Tracker", icon: Users },
  { to: "/quizzes", label: "Quiz Engine", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, totalPoints, displayName } = useStudiOS();
  const rank = getRank(totalPoints);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 lg:hidden glass rounded-xl p-2.5 text-foreground"
        aria-label="Toggle navigation"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 z-40 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex-shrink-0`}
      >
        <div className="h-full m-3 lg:m-4 glass-strong rounded-3xl p-5 flex flex-col">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 pb-6 mb-2 border-b border-glass-border">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center glow-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gradient">StudiOS</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Focus OS</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1.5 mt-2 overflow-y-auto no-scrollbar">
            {items.map(({ to, label, icon: Icon }) => {
              const active = path === to;
              return (
                <Link
                  key={to} to={to}
                  onClick={() => setOpen(false)}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                    ${active
                      ? "bg-gradient-to-r from-primary/30 to-primary-glow/10 text-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-glass"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary-glow shadow-[0_0_12px_oklch(0.7_0.22_290)]"
                    />
                  )}
                  <Icon className={`w-[18px] h-[18px] ${active ? "text-primary-glow drop-shadow-[0_0_8px_oklch(0.7_0.22_290)]" : ""}`} />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth footer */}
          <div className="pt-4 border-t border-glass-border">
            {user ? (
              <Link to="/profile" className="block glass rounded-2xl p-3 hover:bg-glass transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-semibold">
                    {(displayName ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{displayName ?? user.email}</p>
                    <p className="text-[10px] text-primary-glow uppercase tracking-wider">{rank.name} · {totalPoints} pts</p>
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="block text-center text-xs text-muted-foreground hover:text-primary-glow transition-colors py-2"
              >
                Sign in to save progress →
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}