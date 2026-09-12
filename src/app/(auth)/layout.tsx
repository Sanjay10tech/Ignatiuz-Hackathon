import { Zap, Brain, Target, TrendingUp } from "lucide-react";

import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding hero — hidden on small screens */}
      <div className="brand-gradient relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-white">
        <div className="grid-dots pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold">{APP_NAME}</p>
            <p className="text-xs text-white/70">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            Turn raw leads into ranked, actionable pipeline.
          </h2>
          <p className="mt-3 text-sm text-white/80">
            LeadIQ analyzes each lead with AI and tells your team who to call
            first — with the reasoning to back it up.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-white/70">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          Sales Intelligence Engine
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-muted/30 p-4 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Compact brand mark for mobile (hero is hidden there) */}
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <div className="brand-gradient mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm">
              <Zap className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-semibold">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
