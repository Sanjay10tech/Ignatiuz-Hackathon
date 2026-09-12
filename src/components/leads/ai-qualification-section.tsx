"use client";

import * as React from "react";
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  Target,
  HelpCircle,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { StoredAnalysis } from "@/services/analyses";
import type { AiAnalysis } from "@/validation/analysis";

interface DisplayAnalysis {
  score: number;
  qualification: string;
  buyingIntent: string;
  reason: string;
  signals: string[];
  risks: string[];
  missingInformation: string[];
  nextAction: string;
  priority: string;
  timeframe: string | null;
  buyingIntentScore: number | null;
  budgetFitScore: number | null;
  businessFitScore: number | null;
  urgencyScore: number | null;
}

function toDisplay(a: StoredAnalysis): DisplayAnalysis {
  return {
    score: a.score,
    qualification: a.qualification,
    buyingIntent: a.buyingIntent,
    reason: a.reason,
    signals: a.signals,
    risks: a.risks,
    missingInformation: a.missingInformation,
    nextAction: a.nextAction,
    priority: a.priority,
    timeframe: a.timeframe,
    buyingIntentScore: a.buyingIntentScore,
    budgetFitScore: a.budgetFitScore,
    businessFitScore: a.businessFitScore,
    urgencyScore: a.urgencyScore,
  };
}

function fromApi(a: AiAnalysis): DisplayAnalysis {
  return {
    score: a.score,
    qualification: a.qualification,
    buyingIntent: a.buying_intent,
    reason: a.reason,
    signals: a.signals,
    risks: a.risks,
    missingInformation: a.missing_information,
    nextAction: a.next_action,
    priority: a.priority,
    timeframe: a.timeframe,
    buyingIntentScore: a.buying_intent_score,
    budgetFitScore: a.budget_fit_score,
    businessFitScore: a.business_fit_score,
    urgencyScore: a.urgency_score,
  };
}

function qualificationVariant(q: string): "success" | "warning" | "secondary" {
  if (q === "HOT") return "success";
  if (q === "WARM") return "warning";
  return "secondary";
}

function levelVariant(level: string): "success" | "warning" | "secondary" {
  if (level === "HIGH") return "success";
  if (level === "MEDIUM") return "warning";
  return "secondary";
}

export function AiQualificationSection({
  leadId,
  initialAnalysis,
}: {
  leadId: string;
  initialAnalysis: StoredAnalysis | null;
}) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = React.useState<DisplayAnalysis | null>(
    initialAnalysis ? toDisplay(initialAnalysis) : null
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/leads/${leadId}/analyze`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        analysis?: AiAnalysis;
        error?: string;
      };

      if (!res.ok || !data.analysis) {
        const message = data.error ?? "Could not analyze the lead.";
        setError(message);
        toast(message, "error");
        return;
      }

      setAnalysis(fromApi(data.analysis));
      toast("Lead analyzed successfully.", "success");
    } catch {
      const message = "Could not analyze the lead. Please try again.";
      setError(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          AI Qualification
        </CardTitle>
        <Button type="button" onClick={handleAnalyze} disabled={loading}>
          {loading
            ? "Analyzing…"
            : analysis
              ? "Re-analyze"
              : "Analyze Lead with AI"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error && !analysis ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <p>{error}</p>
          </div>
        ) : analysis ? (
          <AnalysisView analysis={analysis} />
        ) : (
          <div className="flex items-center justify-center rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            AI analysis will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalysisView({ analysis }: { analysis: DisplayAnalysis }) {
  return (
    <div className="space-y-6">
      <ScoreHeader analysis={analysis} />
      <ScoreBreakdown analysis={analysis} />
      <NextBestAction analysis={analysis} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SignalList
          title="Positive signals"
          icon={
            <TrendingUp className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          }
          items={analysis.signals}
        />
        <SignalList
          title="Risks"
          icon={
            <ShieldAlert
              className="h-3.5 w-3.5 text-destructive"
              aria-hidden="true"
            />
          }
          items={analysis.risks}
        />
      </div>
      <QualificationGaps items={analysis.missingInformation} />
      <Reason reason={analysis.reason} />
    </div>
  );
}

function ScoreHeader({ analysis }: { analysis: DisplayAnalysis }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular-nums">
          {analysis.score}
        </span>
        <span className="text-lg text-muted-foreground">/100</span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Qualification
          </span>
          <Badge variant={qualificationVariant(analysis.qualification)}>
            {analysis.qualification}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Buying intent
          </span>
          <Badge variant={levelVariant(analysis.buyingIntent)}>
            {analysis.buyingIntent}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdown({ analysis }: { analysis: DisplayAnalysis }) {
  const rows: { label: string; value: number | null }[] = [
    { label: "Buying Intent", value: analysis.buyingIntentScore },
    { label: "Budget Fit", value: analysis.budgetFitScore },
    { label: "Business Fit", value: analysis.businessFitScore },
    { label: "Urgency", value: analysis.urgencyScore },
  ];

  const hasAny = rows.some((r) => r.value !== null);
  if (!hasAny) return null;

  return (
    <div>
      <h4 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
        Score breakdown
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <ScoreBar key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value === null ? "—" : `${value}/100`}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value ?? undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn(
            "h-full rounded-full",
            pct >= 80
              ? "bg-success"
              : pct >= 60
                ? "bg-warning"
                : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function NextBestAction({ analysis }: { analysis: DisplayAnalysis }) {
  if (!analysis.nextAction) return null;
  return (
    <div className="rounded-lg border bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" aria-hidden="true" />
        <h4 className="text-sm font-semibold">Next best action</h4>
      </div>
      <p className="mt-2 text-sm font-medium">{analysis.nextAction}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Priority
          </span>
          <Badge variant={levelVariant(analysis.priority)}>
            {analysis.priority}
          </Badge>
        </div>
        {analysis.timeframe ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{analysis.timeframe}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SignalList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </h4>
      {items.length ? (
        <ul className="mt-2 space-y-1.5 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="text-muted-foreground">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">None identified.</p>
      )}
    </div>
  );
}

function QualificationGaps({ items }: { items: string[] }) {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <HelpCircle className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
        Qualification gaps
      </h4>
      {items.length ? (
        <ul className="mt-2 space-y-1.5 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="text-muted-foreground">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          No missing information identified.
        </p>
      )}
    </div>
  );
}

function Reason({ reason }: { reason: string }) {
  if (!reason) return null;
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wide text-muted-foreground">
        Why this score
      </h4>
      <p className="mt-1 text-sm leading-relaxed">{reason}</p>
    </div>
  );
}
