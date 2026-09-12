"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { isSupabaseConfigured } from "@/lib/env";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import {
  createLeadAction,
  type LeadFormState,
} from "@/app/(app)/leads/actions";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Saving…" : "Save lead"}
    </Button>
  );
}

/**
 * Add Lead form. Submits to a server action that validates with Zod and
 * persists via the service layer. On success it shows a toast and redirects
 * to the Leads list.
 */
export function AddLeadForm() {
  const router = useRouter();
  const { toast } = useToast();
  const configured = isSupabaseConfigured();
  const [state, formAction] = useFormState<LeadFormState, FormData>(
    createLeadAction,
    {}
  );

  React.useEffect(() => {
    if (state.ok) {
      toast("Lead created successfully.", "success");
      router.push("/leads");
    }
  }, [state.ok, router, toast]);

  return (
    <form action={formAction} noValidate>
      <Card className="panel-elevated">
        <CardHeader>
          <CardTitle>Lead details</CardTitle>
          <CardDescription>
            Provide as much context as you can. Richer input produces a more
            accurate qualification score later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LeadFormFields
            disabled={!configured}
            errors={state.fieldErrors}
          />

          {state.error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <p>{state.error}</p>
            </div>
          ) : null}

          {!configured ? (
            <div
              role="status"
              className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-foreground"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                aria-hidden="true"
              />
              <p>
                Saving is not available yet. Set the Supabase environment
                variables to enable persistence.
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <SubmitButton disabled={!configured} />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
