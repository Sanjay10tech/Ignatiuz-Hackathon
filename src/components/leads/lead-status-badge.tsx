import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/types";

const LABELS: Record<LeadStatus, string> = {
  new: "New",
  analyzed: "Analyzed",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

const VARIANTS: Record<
  LeadStatus,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  new: "secondary",
  analyzed: "default",
  contacted: "warning",
  qualified: "default",
  converted: "success",
  lost: "destructive",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
