import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Flame,
  ThermometerSun,
  Snowflake,
  Target,
  ClipboardList,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { LeadDistributionChart } from "@/components/dashboard/lead-distribution-chart";
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart";
import { IndustryCountChart } from "@/components/dashboard/industry-count-chart";
import { IndustryScoreChart } from "@/components/dashboard/industry-score-chart";
import { TopPriorityLeads } from "@/components/dashboard/top-priority-leads";
import { AiRecommendation } from "@/components/dashboard/ai-recommendation";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { dashboardService } from "@/services/dashboard";
import { formatBudget, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await dashboardService.getStats();

  const kpis = [
    {
      label: "Total Leads",
      value: stats.total,
      icon: Users,
      tint: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
      accent: "bg-indigo-500",
    },
    {
      label: "Hot Leads",
      value: stats.hot,
      icon: Flame,
      tint: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
      accent: "bg-red-500",
    },
    {
      label: "Warm Leads",
      value: stats.warm,
      icon: ThermometerSun,
      tint: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
      accent: "bg-amber-500",
    },
    {
      label: "Cold Leads",
      value: stats.cold,
      icon: Snowflake,
      tint: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
      accent: "bg-sky-500",
    },
  ];

  const insights = [
    {
      label: "Hot Leads",
      value: stats.hot,
      icon: Flame,
      tint: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
    },
    {
      label: "Leads Needing Action",
      value: stats.needingAction,
      icon: ClipboardList,
      tint: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
    },
    {
      label: "Average Lead Score",
      value: stats.total ? `${stats.averageScore}/100` : "—",
      icon: Target,
      tint: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Gradient hero header */}
      <div className="hero-gradient relative overflow-hidden rounded-2xl p-6 text-white shadow-sm md:p-8">
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              An overview of your sales pipeline and AI lead quality.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/leads"
              className="inline-flex h-9 items-center justify-center rounded-md border border-white/30 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              View All Leads
            </Link>
            <Link
              href="/leads/new"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Link>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="panel-elevated card-hover relative overflow-hidden"
          >
            <span
              className={`absolute inset-x-0 top-0 h-1 ${kpi.accent}`}
              aria-hidden="true"
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tint}`}
              >
                <kpi.icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums tracking-tight">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI recommendation banner */}
      <AiRecommendation stats={stats} />

      {/* Top priority leads + conversion funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopPriorityLeads leads={stats.topLeads} />
        <ConversionFunnel steps={stats.funnel} />
      </div>

      {/* AI insights — prominent */}
      <Card className="panel-elevated overflow-hidden">
        <div className="h-1 w-full brand-gradient" aria-hidden="true" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg brand-gradient text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            AI Insights
          </CardTitle>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Powered by AI
          </span>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {insights.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border bg-gradient-to-br from-muted/40 to-transparent p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-2.5 text-sm">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.tint}`}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-xl font-semibold tabular-nums">
                {item.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="panel-elevated">
          <CardHeader>
            <CardTitle>Lead status distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart data={stats.statusDistribution} />
          </CardContent>
        </Card>

        <Card className="panel-elevated">
          <CardHeader>
            <CardTitle>HOT / WARM / COLD distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadDistributionChart
              hot={stats.hot}
              warm={stats.warm}
              cold={stats.cold}
              unscored={stats.unscored}
            />
          </CardContent>
        </Card>

        <Card className="panel-elevated">
          <CardHeader>
            <CardTitle>Leads by industry</CardTitle>
          </CardHeader>
          <CardContent>
            <IndustryCountChart data={stats.byIndustry} />
          </CardContent>
        </Card>

        <Card className="panel-elevated">
          <CardHeader>
            <CardTitle>Average lead score by industry</CardTitle>
          </CardHeader>
          <CardContent>
            <IndustryScoreChart data={stats.byIndustry} />
          </CardContent>
        </Card>
      </div>

      {/* Recent leads */}
      <Card className="panel-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Recent leads</CardTitle>
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </CardHeader>
        <CardContent className={stats.recentLeads.length ? "p-0" : undefined}>
          {stats.recentLeads.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3">{lead.company}</td>
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
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No leads yet"
              description="Add your first lead to start building your pipeline."
              action={
                <Link href="/leads/new" className={buttonVariants()}>
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
