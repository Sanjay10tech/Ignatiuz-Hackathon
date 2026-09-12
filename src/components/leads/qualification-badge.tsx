import { Flame, ThermometerSun, Snowflake } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type Qualification = "HOT" | "WARM" | "COLD" | string;

const CONFIG: Record<
  string,
  { variant: "hot" | "warm" | "cold"; Icon: typeof Flame }
> = {
  HOT: { variant: "hot", Icon: Flame },
  WARM: { variant: "warm", Icon: ThermometerSun },
  COLD: { variant: "cold", Icon: Snowflake },
};

/**
 * Visually distinct HOT / WARM / COLD chip with a matching icon.
 */
export function QualificationBadge({
  qualification,
}: {
  qualification: Qualification;
}) {
  const cfg = CONFIG[qualification] ?? CONFIG.COLD;
  const { variant, Icon } = cfg;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {qualification}
    </Badge>
  );
}
