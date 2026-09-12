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

import type { IndustryDatum } from "@/services/dashboard";
import { ChartEmpty, chartTooltipStyle } from "./chart-shared";

function scoreColor(score: number) {
  if (score >= 80) return "#ef4444"; // HOT
  if (score >= 60) return "#f59e0b"; // WARM
  return "#0ea5e9"; // COLD
}

/**
 * Average AI score by industry. Only industries that have at least one
 * analyzed lead are shown.
 */
export function IndustryScoreChart({ data }: { data: IndustryDatum[] }) {
  const chartData = data
    .filter((d) => d.averageScore !== null)
    .map((d) => ({ industry: d.industry, score: d.averageScore as number }));

  if (!chartData.length) {
    return <ChartEmpty message="Analyze leads to see average scores by industry." />;
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 8, bottom: 0, left: -18 }}
          barCategoryGap="26%"
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="industry"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            dy={4}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={40}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.6)" }} {...chartTooltipStyle} />
          <defs>
            {chartData.map((entry) => {
              const c = scoreColor(entry.score);
              return (
                <linearGradient
                  key={entry.industry}
                  id={`grad-score-${entry.industry.replace(/\s+/g, "-")}`}
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
          <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={56}>
            <LabelList
              dataKey="score"
              position="top"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            />
            {chartData.map((entry) => (
              <Cell
                key={entry.industry}
                fill={`url(#grad-score-${entry.industry.replace(/\s+/g, "-")})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
