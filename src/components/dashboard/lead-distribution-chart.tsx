"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Datum {
  name: string;
  value: number;
  color: string;
}

/**
 * Simple lead distribution bar chart by qualification band. Colors use the
 * app's semantic tokens for consistency with the rest of the UI.
 */
export function LeadDistributionChart({
  hot,
  warm,
  cold,
  unscored,
}: {
  hot: number;
  warm: number;
  cold: number;
  unscored: number;
}) {
  const data: Datum[] = [
    { name: "Hot", value: hot, color: "hsl(var(--success))" },
    { name: "Warm", value: warm, color: "hsl(var(--warning))" },
    { name: "Cold", value: cold, color: "hsl(var(--muted-foreground))" },
    { name: "Unscored", value: unscored, color: "hsl(var(--primary))" },
  ];

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No lead data to display yet.
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
