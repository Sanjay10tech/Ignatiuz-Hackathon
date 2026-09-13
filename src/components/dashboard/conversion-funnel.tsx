import { Filter } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FunnelStep } from "@/services/dashboard";

const STEP_COLORS = [
  "bg-indigo-500",
  "bg-blue-500",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-emerald-500",
];

/**
 * Lead conversion funnel: Total → Analyzed → Contacted → Qualified → Converted.
 * Bar widths are proportional to the largest step (Total).
 */
export function ConversionFunnel({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(1, ...steps.map((s) => s.count));

  return (
    <Card className="panel-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Filter className="h-4 w-4" aria-hidden="true" />
          </span>
          Lead conversion funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => {
          const pct = Math.round((step.count / max) * 100);
          const conv =
            steps[0].count > 0
              ? Math.round((step.count / steps[0].count) * 100)
              : 0;
          return (
            <div key={step.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{step.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {step.count}
                  {i > 0 ? (
                    <span className="ml-2 text-xs">({conv}%)</span>
                  ) : null}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${STEP_COLORS[i] ?? "bg-primary"} transition-all`}
                  style={{ width: `${Math.max(pct, step.count > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
