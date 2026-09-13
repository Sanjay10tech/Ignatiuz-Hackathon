import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { QualificationBadge } from "@/components/leads/qualification-badge";
import type { TopLead } from "@/services/dashboard";

/**
 * Top 3 leads by AI score, with qualification and next action.
 */
export function TopPriorityLeads({ leads }: { leads: TopLead[] }) {
  return (
    <Card className="panel-elevated">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
            <Trophy className="h-4 w-4" aria-hidden="true" />
          </span>
          Top priority leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length ? (
          <ul className="space-y-3">
            {leads.map((lead, i) => (
              <li
                key={lead.id}
                className="flex flex-col gap-3 rounded-xl border bg-gradient-to-br from-muted/40 to-transparent p-3 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {lead.company}
                    </p>
                    {lead.nextAction ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Next:
                        </span>{" "}
                        {lead.nextAction}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-semibold tabular-nums leading-none">
                      {lead.score}
                      <span className="text-xs font-normal text-muted-foreground">
                        /100
                      </span>
                    </div>
                  </div>
                  <QualificationBadge qualification={lead.qualification} />
                  <Link
                    href={`/leads/${lead.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    View Lead
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm font-medium">No analyzed leads yet</p>
            <p className="text-sm text-muted-foreground">
              Analyze leads with AI to see your top priorities.
            </p>
            <Link
              href="/leads"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Go to leads
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
