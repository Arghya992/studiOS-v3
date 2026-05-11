import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brain } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — StudiOS" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/profile" });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        nav({ to: "/" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center glow-primary">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary-glow">StudiOS</p>
            <h1 className="text-xl font-semibold">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <Field label="Display name" type="text" value={name} onChange={setName} placeholder="Your name" />
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@studios.app" required />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

          <button type="submit" disabled={loading}
            className="w-full glass-strong px-5 py-3 rounded-2xl text-sm font-medium hover:glow-primary transition-all disabled:opacity-50">
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="w-full text-center text-xs text-muted-foreground hover:text-primary-glow mt-5">
          {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, ...rest }: {
  label: string; value: string; onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-primary-glow/60 transition-colors"
      />
    </label>
  );
}
