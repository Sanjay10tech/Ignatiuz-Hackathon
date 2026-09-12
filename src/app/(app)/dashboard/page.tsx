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
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
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
import { dashboardService } from "@/services/dashboard";
import { formatBudget, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await dashboardService.getStats();

  const kpis = [
    { label: "Total Leads", value: stats.total, icon: Users },
    { label: "Hot Leads", value: stats.hot, icon: Flame },
    { label: "Warm Leads", value: stats.warm, icon: ThermometerSun },
    { label: "Cold Leads", value: stats.cold, icon: Snowflake },
  ];

  const insights = [
    { label: "Hot Leads", value: stats.hot, icon: Flame },
    { label: "Leads Needing Action", value: stats.needingAction, icon: ClipboardList },
    {
      label: "Average Lead Score",
      value: stats.total ? `${stats.averageScore}/100` : "—",
      icon: Target,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="An overview of your sales pipeline and lead quality."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/leads"
              className={buttonVariants({ variant: "outline" })}
            >
              View All Leads
            </Link>
            <Link href="/leads/new" className={buttonVariants()}>
              <Plus className="h-4 w-4" />
              Add Lead
            </Link>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Distribution chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead distribution</CardTitle>
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

        {/* AI insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </div>
                <span className="text-lg font-semibold tabular-nums">
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent leads */}
      <Card>
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
