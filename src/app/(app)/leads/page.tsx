import type { Metadata } from "next";
import Link from "next/link";
import { Plus, GitCompare } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LeadsView } from "@/components/leads/leads-view";
import { leadsService } from "@/services/leads";

export const metadata: Metadata = {
  title: "Leads",
};

// Always render fresh data for the authenticated user.
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  // Errors bubble to the route's error boundary (error.tsx).
  const leads = await leadsService.getLeads();

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Your full lead pipeline with qualification status."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/leads/compare"
              className={buttonVariants({ variant: "outline" })}
            >
              <GitCompare className="h-4 w-4" />
              Compare
            </Link>
            <Link href="/leads/new" className={buttonVariants()}>
              <Plus className="h-4 w-4" />
              Add Lead
            </Link>
          </div>
        }
      />
      <LeadsView leads={leads} />
    </div>
  );
}
