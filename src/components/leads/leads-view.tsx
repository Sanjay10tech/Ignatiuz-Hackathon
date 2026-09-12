"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Users, Plus } from "lucide-react";

import type { Lead } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { LeadsTable } from "./leads-table";

/**
 * Client wrapper around the leads table that provides a simple case-insensitive
 * search by name or company. Data is fetched server-side and passed in.
 */
export function LeadsView({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q)
    );
  }, [leads, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or company"
          aria-label="Search leads by name or company"
          className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground transition-colors hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <Card className="panel-elevated">
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <LeadsTable leads={filtered} />
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title={query ? "No matching leads" : "No leads yet"}
                description={
                  query
                    ? "Try a different name or company."
                    : "Add your first lead to start building your pipeline."
                }
                action={
                  query ? undefined : (
                    <Link href="/leads/new" className={buttonVariants()}>
                      <Plus className="h-4 w-4" />
                      Add Lead
                    </Link>
                  )
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
