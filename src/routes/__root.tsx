import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <p className="mt-3 text-muted-foreground">This page drifted into deep space.</p>
        <Link to="/" className="inline-block mt-6 glass px-5 py-2.5 rounded-xl text-sm hover:glow-primary">
          Back to Focus Hub
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "StudiOS — Integrated Focus & Learning Ecosystem" },
      { name: "description", content: "Deep work, Pomodoro, real-time study tracking and quizzes — one focus operating system." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: () => (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 lg:py-10">
        <Outlet />
      </main>
      <Toaster />
    </div>
  ),
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}
