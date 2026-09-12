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

import type { StatusDatum } from "@/services/dashboard";
import { ChartEmpty, chartTooltipStyle } from "./chart-shared";

const STATUS_COLORS: Record<string, string> = {
  new: "#94a3b8",
  analyzed: "#6366f1",
  contacted: "#f59e0b",
  qualified: "#3b82f6",
  converted: "#10b981",
  lost: "#ef4444",
};

/**
 * Lead counts grouped by pipeline status.
 */
export function StatusDistributionChart({ data }: { data: StatusDatum[] }) {
  if (!data.length) {
    return <ChartEmpty message="No leads to chart yet." />;
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 8, bottom: 0, left: -18 }}
          barCategoryGap="26%"
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="label"
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
          <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.6)" }} {...chartTooltipStyle} />
          <defs>
            {data.map((entry) => {
              const c = STATUS_COLORS[entry.status] ?? "#6366f1";
              return (
                <linearGradient
                  key={entry.status}
                  id={`grad-status-${entry.status}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.55} />
                </linearGradient>
              );
            })}
          </defs>
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
            <LabelList
              dataKey="count"
              position="top"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            />
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={`url(#grad-status-${entry.status})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
