import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="flex-1 px-4 py-10">
        <Outlet />
      </main>
      <Toaster />
    </div>
  ),
});