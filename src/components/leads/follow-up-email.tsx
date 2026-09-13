"use client";

import * as React from "react";
import { Mail, AlertCircle, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface Email {
  subject: string;
  body: string;
}

/**
 * AI follow-up email generator. Calls the server route (which uses Gemini +
 * the lead's latest analysis), then shows subject, body, and a Copy button.
 */
export function FollowUpEmail({ leadId }: { leadId: string }) {
  const { toast } = useToast();
  const [email, setEmail] = React.useState<Email | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/leads/${leadId}/email`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        email?: Email;
        error?: string;
      };
      if (!res.ok || !data.email) {
        const message = data.error ?? "Could not generate the email.";
        setError(message);
        toast(message, "error");
        return;
      }
      setEmail(data.email);
      toast("Follow-up email generated.", "success");
    } catch {
      const message = "Could not generate the email. Please try again.";
      setError(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!email) return;
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast("Email copied to clipboard.", "success");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Could not copy. Select and copy manually.", "error");
    }
  }

  return (
    <Card className="panel-elevated overflow-hidden">
      <div className="h-1 w-full brand-gradient" aria-hidden="true" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg brand-gradient text-white">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </span>
          AI Follow-up Email
        </CardTitle>
        <Button type="button" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating…" : email ? "Regenerate" : "Generate Email"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error && !email ? (
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
        ) : email ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Subject
              </p>
              <p className="mt-1 text-sm font-medium">{email.subject}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Body
              </p>
              <div className="mt-1 whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">
                {email.body}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Generate a personalized follow-up email for this lead.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
