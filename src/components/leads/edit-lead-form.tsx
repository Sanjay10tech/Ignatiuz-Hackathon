"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import { updateLeadAction, type LeadFormState } from "@/app/(app)/leads/actions";
import type { Lead } from "@/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

/**
 * Edit an existing lead. Prefills the shared fields and submits to the update
 * server action; on success shows a toast and returns to the lead detail.
 */
export function EditLeadForm({ lead }: { lead: Lead }) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useFormState<LeadFormState, FormData>(
    updateLeadAction,
    {}
  );

  React.useEffect(() => {
    if (state.ok) {
      toast("Lead updated successfully.", "success");
      router.push(`/leads/${lead.id}`);
    }
  }, [state.ok, router, toast, lead.id]);

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="id" value={lead.id} />
      <Card>
        <CardHeader>
          <CardTitle>Edit lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <LeadFormFields errors={state.fieldErrors} defaults={lead} />

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

          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/leads/${lead.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Link>
            <SubmitButton />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
