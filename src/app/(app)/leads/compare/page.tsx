import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LeadComparison } from "@/components/leads/lead-comparison";
import { comparisonService } from "@/services/comparison";

export const metadata: Metadata = {
  title: "Compare leads",
};

export const dynamic = "force-dynamic";

export default async function CompareLeadsPage() {
  const leads = await comparisonService.getComparableLeads();

  return (
    <div>
      <PageHeader
        title="Compare leads"
        description="Select up to 3 leads to compare score, qualification, buying intent and next action."
        action={
          <Link
            href="/leads"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to leads
          </Link>
        }
      />
      <LeadComparison leads={leads} />
    </div>
  );
}
