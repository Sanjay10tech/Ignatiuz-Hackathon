import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

import type { DashboardStats } from "@/services/dashboard";

/**
 * Builds a concise, actionable recommendation from real analysis data.
 */
function buildMessage(stats: DashboardStats): string {
  if (stats.hotNeedingAction > 0) {
    const n = stats.hotNeedingAction;
    return `${n} high-intent ${n === 1 ? "lead" : "leads"} should be contacted today.`;
  }
  if (stats.needingAction > 0) {
    const n = stats.needingAction;
    return `${n} ${n === 1 ? "lead has" : "leads have"} a pending recommended action to follow up on.`;
  }
  if (stats.hot > 0) {
    return `You have ${stats.hot} HOT ${stats.hot === 1 ? "lead" : "leads"} — keep the momentum going.`;
  }
  if (stats.total > 0 && stats.hot + stats.warm + stats.cold === 0) {
    return "Analyze your leads with AI to surface who to prioritize.";
  }
  return "Your pipeline is up to date. Add new leads to keep it growing.";
}

export function AiRecommendation({ stats }: { stats: DashboardStats }) {
  const message = buildMessage(stats);

  return (
    <div className="hero-gradient relative overflow-hidden rounded-2xl p-5 text-white shadow-sm md:p-6">
      <div className="grid-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">
              AI recommendation
            </p>
            <p className="mt-0.5 text-base font-semibold">{message}</p>
          </div>
        </div>
        <Link
          href="/leads"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-white/90"
        >
          View priority leads
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
