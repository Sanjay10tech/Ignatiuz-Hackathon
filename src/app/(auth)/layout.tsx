import { Zap, Brain, Target, TrendingUp } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

const HIGHLIGHTS = [
  {
    icon: Brain,
    title: "AI qualification",
    detail: "Explainable 0–100 scoring for every lead.",
  },
  {
    icon: Target,
    title: "Next best action",
    detail: "Know exactly who to prioritize and why.",
  },
  {
    icon: TrendingUp,
    title: "Pipeline clarity",
    detail: "HOT / WARM / COLD at a glance.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Branding hero — hidden on small screens */}
      <div className="auth-hero relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-white">
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-40" />

        {/* Logo */}
        <div className="animate-fade-up relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
        </div>

        {/* Tagline + value prop */}
        <div
          className="animate-fade-up relative max-w-md"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">
            Analyze. Qualify. Act.
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Turn raw leads into ranked, actionable pipeline.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            LeadIQ analyzes every lead with AI, scores buying intent, and tells
            your team who to contact first — with the reasoning to back it up.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item, i) => (
              <li
                key={item.title}
                className="animate-fade-up flex items-start gap-3"
                style={{ animationDelay: `${160 + i * 80}ms` }}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-white/65">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p
          className="animate-fade-up relative text-xs text-white/50"
          style={{ animationDelay: "440ms" }}
        >
          Sales Intelligence Engine
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-muted/30 p-4 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Compact brand mark for mobile (hero is hidden there) */}
          <div className="animate-fade-up mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="brand-gradient mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm">
              <Zap className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-semibold">{APP_NAME}</h1>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Analyze. Qualify. Act.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
