import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useStudiOS, getRank, ranks } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — StudiOS" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, displayName, totalPoints, totalFocusSeconds } = useStudiOS();
  const rank = getRank(totalPoints);
  const nextIdx = ranks.findIndex((r) => r.name === rank.name) + 1;
  const next = ranks[nextIdx];
  const progress = next ? Math.min(1, (totalPoints - rank.min) / (next.min - rank.min)) : 1;

  if (!user) {
    return (
      <div className="max-w-md mx-auto pl-12 lg:pl-0 pt-10">
        <div className="glass-strong rounded-3xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center mx-auto mb-5 glow-primary">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Sign in to StudiOS</h2>
          <p className="text-sm text-muted-foreground mb-6">Save your points, climb ranks, and join the live tracker.</p>
          <Link to="/auth" className="inline-block glass-strong px-6 py-3 rounded-2xl text-sm font-medium hover:glow-primary">
            Authenticate →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto pl-12 lg:pl-0">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.4em] text-primary-glow mb-2">Identity</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">Profile</h1>
      </header>

      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent grid place-items-center text-3xl font-semibold glow-primary">
            {(displayName ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{displayName ?? user.email}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Rank</p>
            <p className="text-xl font-semibold mt-1 text-gradient">{rank.name}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Points</p>
            <p className="text-xl font-semibold mt-1">{totalPoints.toLocaleString()}</p>
          </div>
        </div>

        {next && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progress to {next.name}</span>
              <span>{totalPoints - rank.min} / {next.min - rank.min} pts</span>
            </div>
            <div className="h-2 rounded-full bg-glass overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-primary to-primary-glow"
                animate={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-6">
          Total focus: <span className="text-foreground">{Math.floor(totalFocusSeconds / 3600)}h {Math.floor((totalFocusSeconds % 3600) / 60)}m</span>
        </p>

        <button
          onClick={() => supabase.auth.signOut()}
          className="glass px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </motion.div>
  );
}
