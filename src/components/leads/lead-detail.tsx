import Link from "next/link";
import { Pencil } from "lucide-react";

import type { Lead } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { DeleteLeadButton } from "@/components/leads/delete-lead-button";
import { AiQualificationSection } from "@/components/leads/ai-qualification-section";
import { formatBudget } from "@/lib/utils";
import type { StoredAnalysis } from "@/services/analyses";

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

export function LeadDetail({
  lead,
  analysis,
}: {
  lead: Lead;
  analysis: StoredAnalysis | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={`/leads/${lead.id}/edit`}
          className={buttonVariants({ variant: "outline" })}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
      </div>

      <Card className="panel-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Lead information</CardTitle>
          <LeadStatusBadge status={lead.status} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DetailItem label="Name" value={lead.name} />
            <DetailItem label="Company" value={lead.company} />
            <DetailItem label="Email" value={lead.email ?? "—"} />
            <DetailItem label="Job title" value={lead.jobTitle ?? "—"} />
            <DetailItem label="Industry" value={lead.industry ?? "—"} />
            <DetailItem label="Budget" value={formatBudget(lead.budget)} />
            <DetailItem label="Timeline" value={lead.timeline ?? "—"} />
            <DetailItem
              label="Requirement"
              value={
                <span className="whitespace-pre-wrap">{lead.requirement}</span>
              }
            />
            <DetailItem
              label="Pain point"
              value={
                lead.painPoint ? (
                  <span className="whitespace-pre-wrap">{lead.painPoint}</span>
                ) : (
                  "—"
                )
              }
            />
          </dl>
        </CardContent>
      </Card>

      <AiQualificationSection leadId={lead.id} initialAnalysis={analysis} />
    </div>
  );
}
