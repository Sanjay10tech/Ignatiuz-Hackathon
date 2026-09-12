import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LeadDetail } from "@/components/leads/lead-detail";
import { leadsService } from "@/services/leads";
import { analysesService } from "@/services/analyses";

export const metadata: Metadata = {
  title: "Lead details",
};

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const lead = await leadsService.getLeadById(params.id);

  if (!lead) {
    notFound();
  }

  const analysis = await analysesService.getLatestAnalysis(lead.id);

  return (
    <div>
      <PageHeader
        title={lead.name}
        description={lead.company}
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
      <LeadDetail lead={lead} analysis={analysis} />
    </div>
  );
}
