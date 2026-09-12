"use client";

/**
 * Shared styling and helpers for dashboard charts, so every chart looks
 * consistent without duplicating props.
 */

export const chartTooltipStyle = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    boxShadow: "0 4px 12px hsl(var(--foreground) / 0.08)",
    fontSize: 12,
  },
  labelStyle: { fontWeight: 600 },
} as const;

export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium">No data yet</p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
