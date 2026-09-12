"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { IndustryDatum } from "@/services/dashboard";
import { ChartEmpty, chartTooltipStyle } from "./chart-shared";

/**
 * Lead counts grouped by industry (horizontal bars for readable labels).
 */
export function IndustryCountChart({ data }: { data: IndustryDatum[] }) {
  if (!data.length) {
    return <ChartEmpty message="Add leads with industries to see this." />;
  }

  const chartData = data.map((d) => ({ industry: d.industry, count: d.count }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 4, right: 24, bottom: 0, left: 8 }}
          barCategoryGap="24%"
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            type="category"
            dataKey="industry"
            tickLine={false}
            axisLine={false}
            width={96}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.6)" }} {...chartTooltipStyle} />
          <defs>
            <linearGradient id="grad-industry" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.65} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
            </linearGradient>
          </defs>
          <Bar
            dataKey="count"
            fill="url(#grad-industry)"
            radius={[0, 6, 6, 0]}
            maxBarSize={28}
          >
            <LabelList
              dataKey="count"
              position="right"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
