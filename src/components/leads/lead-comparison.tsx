"use client";

import * as React from "react";
import Link from "next/link";
import { Crown, Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { QualificationBadge } from "@/components/leads/qualification-badge";
import { cn } from "@/lib/utils";
import type { ComparableLead } from "@/services/comparison";

const MAX_SELECT = 3;

export function LeadComparison({ leads }: { leads: ComparableLead[] }) {
  const [selected, setSelected] = React.useState<string[]>([]);

  const selectedLeads = React.useMemo(
    () =>
      selected
        .map((id) => leads.find((l) => l.id === id))
        .filter((l): l is ComparableLead => Boolean(l)),
    [selected, leads]
  );

  // Highest-priority lead among the selection = highest score (nulls last).
  const topId = React.useMemo(() => {
    let best: ComparableLead | null = null;
    for (const l of selectedLeads) {
      if (l.score === null) continue;
      if (!best || (best.score ?? -1) < l.score) best = l;
    }
    return best?.id ?? null;
  }, [selectedLeads]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="space-y-6">
      {/* Selector */}
      <Card className="panel-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Select leads to compare</CardTitle>
          <span className="text-sm text-muted-foreground">
            {selected.length}/{MAX_SELECT} selected
          </span>
        </CardHeader>
        <CardContent>
          {leads.length ? (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead) => {
                const isSelected = selected.includes(lead.id);
                const atLimit = selected.length >= MAX_SELECT && !isSelected;
                return (
                  <li key={lead.id}>
                    <button
                      type="button"
                      onClick={() => toggle(lead.id)}
                      disabled={atLimit}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/30",
                        atLimit && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {lead.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {lead.company}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        )}
                        aria-hidden="true"
                      >
                        {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No leads to compare yet. Add some leads first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparison grid */}
      {selectedLeads.length >= 2 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selectedLeads.map((lead) => {
            const isTop = lead.id === topId;
            return (
              <Card
                key={lead.id}
                className={cn(
                  "panel-elevated relative overflow-hidden",
                  isTop && "ring-2 ring-primary"
                )}
              >
                {isTop ? (
                  <div className="flex items-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                    <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                    Highest priority
                  </div>
                ) : null}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{lead.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row label="Score">
                    <span className="text-lg font-semibold tabular-nums">
                      {lead.score !== null ? `${lead.score}/100` : "—"}
                    </span>
                  </Row>
                  <Row label="Qualification">
                    {lead.qualification ? (
                      <QualificationBadge qualification={lead.qualification} />
                    ) : (
                      <span className="text-sm text-muted-foreground">Not analyzed</span>
                    )}
                  </Row>
                  <Row label="Buying intent">
                    <span className="text-sm font-medium">
                      {lead.buyingIntent ?? "—"}
                    </span>
                  </Row>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Next action
                    </p>
                    <p className="mt-1 text-sm">
                      {lead.nextAction ?? "No action yet."}
                    </p>
                  </div>
                  <Link
                    href={`/leads/${lead.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full"
                    )}
                  >
                    View Lead
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Select at least 2 leads to compare them side by side.
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
