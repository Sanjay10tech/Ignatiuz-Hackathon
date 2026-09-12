"use server";

import { revalidatePath } from "next/cache";

import { leadsService, LeadServiceError } from "@/services/leads";
import { leadInputSchema } from "@/validation/lead";

export type LeadFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Backwards-compatible alias used by the Add Lead form. */
export type CreateLeadState = LeadFormState;

function parseLeadForm(formData: FormData) {
  return leadInputSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    jobTitle: formData.get("jobTitle"),
    industry: formData.get("industry"),
    companySize: formData.get("companySize"),
    budget: formData.get("budget"),
    timeline: formData.get("timeline"),
    requirement: formData.get("requirement"),
    painPoint: formData.get("painPoint"),
  });
}

function collectFieldErrors(
  issues: { path: (string | number)[]; message: string }[]
) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

/**
 * Create a lead from submitted form data. Validates with Zod, then delegates
 * to the service layer (which derives the owner from the session).
 */
export async function createLeadAction(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const parsed = parseLeadForm(formData);

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  try {
    await leadsService.createLead(parsed.data);
  } catch (error) {
    if (error instanceof LeadServiceError) {
      return { error: error.message };
    }
    console.error("[createLeadAction]", error);
    return { error: "Could not save the lead. Please try again." };
  }

  revalidatePath("/leads");
  return { ok: true };
}

/**
 * Update an existing lead. The id is passed via a hidden form field and
 * ownership is enforced in the service layer.
 */
export async function updateLeadAction(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing lead reference." };
  }

  const parsed = parseLeadForm(formData);

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  try {
    await leadsService.updateLead(id, parsed.data);
  } catch (error) {
    if (error instanceof LeadServiceError) {
      return { error: error.message };
    }
    console.error("[updateLeadAction]", error);
    return { error: "Could not update the lead. Please try again." };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { ok: true };
}

export type DeleteLeadState = {
  ok?: boolean;
  error?: string;
};

/**
 * Delete a lead owned by the authenticated user.
 */
export async function deleteLeadAction(
  _prevState: DeleteLeadState,
  formData: FormData
): Promise<DeleteLeadState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing lead reference." };
  }

  try {
    await leadsService.deleteLead(id);
  } catch (error) {
    if (error instanceof LeadServiceError) {
      return { error: error.message };
    }
    console.error("[deleteLeadAction]", error);
    return { error: "Could not delete the lead. Please try again." };
  }

  revalidatePath("/leads");
  return { ok: true };
}
