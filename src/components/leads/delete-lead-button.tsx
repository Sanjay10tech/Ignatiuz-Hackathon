"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteLeadAction } from "@/app/(app)/leads/actions";

/**
 * Delete control with an inline confirmation step. Calls the delete server
 * action, shows a toast, and navigates back to the leads list on success.
 */
export function DeleteLeadButton({
  leadId,
  leadName,
}: {
  leadId: string;
  leadName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirming, setConfirming] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    setPending(true);
    const formData = new FormData();
    formData.set("id", leadId);
    const result = await deleteLeadAction({}, formData);
    setPending(false);

    if (result.ok) {
      toast(`Deleted ${leadName}.`, "success");
      router.push("/leads");
      router.refresh();
    } else {
      toast(result.error ?? "Could not delete the lead.", "error");
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Are you sure?</span>
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={pending}
      >
        {pending ? "Deleting…" : "Confirm delete"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Cancel
      </Button>
    </div>
  );
}
