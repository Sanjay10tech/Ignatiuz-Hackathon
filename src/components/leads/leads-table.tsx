import Link from "next/link";
import { Eye } from "lucide-react";

import type { Lead } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { formatBudget, formatDate } from "@/lib/utils";
import { LeadStatusBadge } from "./lead-status-badge";

/**
 * Read-only table of leads with a View action for each row.
 */
export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Industry</th>
            <th className="px-4 py-3 font-medium">Budget</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-b last:border-0 hover:bg-muted/40"
            >
              <td className="px-4 py-3">
                <div className="font-medium">{lead.name}</div>
                {lead.email ? (
                  <div className="text-xs text-muted-foreground">
                    {lead.email}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <div>{lead.company}</div>
                {lead.jobTitle ? (
                  <div className="text-xs text-muted-foreground">
                    {lead.jobTitle}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {lead.industry ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatBudget(lead.budget)}
              </td>
              <td className="px-4 py-3">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/leads/${lead.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                  aria-label={`View ${lead.name}`}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
