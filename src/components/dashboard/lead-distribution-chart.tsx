"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartEmpty, chartTooltipStyle } from "./chart-shared";

interface Datum {
  name: string;
  value: number;
  color: string;
}

/**
 * Lead distribution bar chart by qualification band. Colors match the app's
 * HOT / WARM / COLD palette for visual consistency with the badges.
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
  const data: (Datum & { gradId: string })[] = [
    { name: "Hot", value: hot, color: "#ef4444", gradId: "grad-hot" },
    { name: "Warm", value: warm, color: "#f59e0b", gradId: "grad-warm" },
    { name: "Cold", value: cold, color: "#0ea5e9", gradId: "grad-cold" },
    { name: "Unscored", value: unscored, color: "#6366f1", gradId: "grad-unscored" },
  ];

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return <ChartEmpty message="Add and analyze leads to see the distribution." />;
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 8, bottom: 0, left: -18 }}
          barCategoryGap="28%"
        >
          <defs>
            {data.map((entry) => (
              <linearGradient
                key={entry.gradId}
                id={entry.gradId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={entry.color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.55} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            dy={4}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={40}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.6)", radius: 6 }}
            {...chartTooltipStyle}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
            <LabelList
              dataKey="value"
              position="top"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            />
            {data.map((entry) => (
              <Cell key={entry.name} fill={`url(#${entry.gradId})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
