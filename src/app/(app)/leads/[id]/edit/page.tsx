import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EditLeadForm } from "@/components/leads/edit-lead-form";
import { leadsService } from "@/services/leads";

export const metadata: Metadata = {
  title: "Edit lead",
};

export const dynamic = "force-dynamic";

export default async function EditLeadPage({
  params,
}: {
  params: { id: string };
}) {
  const lead = await leadsService.getLeadById(params.id);

  if (!lead) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit lead"
        description={lead.name}
        action={
          <Link
            href={`/leads/${lead.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />
      <EditLeadForm lead={lead} />
    </div>
  );
}
