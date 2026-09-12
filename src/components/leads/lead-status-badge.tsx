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
  "neutral" | "info" | "warm" | "successSoft" | "destructive"
> = {
  new: "neutral",
  analyzed: "info",
  contacted: "warm",
  qualified: "info",
  converted: "successSoft",
  lost: "destructive",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
