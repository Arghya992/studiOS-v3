// Lightweight global store for points/rank — Supabase-ready (mirrored to profiles table when authed)
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type Listener = () => void;
const listeners = new Set<Listener>();

let state = {
  user: null as User | null,
  totalPoints: 0,
  totalFocusSeconds: 0,
  displayName: null as string | null,
};

const emit = () => listeners.forEach((l) => l());

export const ranks = [
  { name: "Novice", min: 0 },
  { name: "Apprentice", min: 100 },
  { name: "Scholar", min: 500 },
  { name: "Adept", min: 1500 },
  { name: "Sage", min: 5000 },
  { name: "Luminary", min: 15000 },
];

export function getRank(points: number) {
  let r = ranks[0];
  for (const x of ranks) if (points >= x.min) r = x;
  return r;
}

export function useStudiOS() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return {
    ...state,
    rank: getRank(state.totalPoints),
    addPoints: addPoints,
    addFocusSeconds: addFocusSeconds,
    logSession,
  };
}

async function refreshProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("total_points,total_focus_seconds,display_name")
    .eq("id", userId)
    .maybeSingle();
  if (data) {
    state = {
      ...state,
      totalPoints: data.total_points ?? 0,
      totalFocusSeconds: data.total_focus_seconds ?? 0,
      displayName: data.display_name ?? null,
    };
    emit();
  }
}

export function addPoints(p: number) {
  state = { ...state, totalPoints: state.totalPoints + p };
  emit();
  if (state.user) {
    supabase.from("profiles").update({ total_points: state.totalPoints }).eq("id", state.user.id).then();
  }
}

export function addFocusSeconds(s: number) {
  state = { ...state, totalFocusSeconds: state.totalFocusSeconds + s };
  emit();
  if (state.user) {
    supabase.from("profiles").update({ total_focus_seconds: state.totalFocusSeconds }).eq("id", state.user.id).then();
  }
}

export async function logSession(durationSec: number, type: "focus" | "pomodoro" = "focus") {
  const points = Math.max(1, Math.floor(durationSec / 60));
  addFocusSeconds(durationSec);
  addPoints(points);
  if (state.user) {
    await supabase.from("focus_sessions").insert({
      user_id: state.user.id,
      duration_seconds: durationSec,
      session_type: type,
      points_earned: points,
    });
  }
  return points;
}

export async function setStatus(status: "studying" | "break" | "idle") {
  if (!state.user) return;
  await supabase.from("profiles").update({
    status,
    status_started_at: status === "idle" ? null : new Date().toISOString(),
  }).eq("id", state.user.id);
}

// Auth bootstrap (client-only)
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((_e, session) => {
    state = { ...state, user: session?.user ?? null };
    emit();
    if (session?.user) refreshProfile(session.user.id);
    else state = { ...state, totalPoints: 0, totalFocusSeconds: 0, displayName: null };
  });
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      state = { ...state, user: data.session.user };
      emit();
      refreshProfile(data.session.user.id);
    }
  });
}
