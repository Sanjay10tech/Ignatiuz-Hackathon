import { z } from "zod";

/**
 * Validation schema for creating/updating a lead. Single source of truth for
 * both the form and server-side validation, so invalid data never reaches the
 * database.
 *
 * Optional text fields accept empty strings from the form and normalize them
 * to `undefined`. Numeric fields (company size, budget) accept empty strings
 * and coerce valid numbers.
 */

// Accepts string | null | undefined (FormData returns null for absent fields)
// and normalizes empty/null to undefined before validating.
const optionalText = (max: number, label = "This field") =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      const v = typeof value === "string" ? value.trim() : "";
      return v === "" ? undefined : v;
    })
    .refine((value) => value === undefined || value.length <= max, {
      message: `${label} is too long`,
    });

const optionalEmail = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    const v = typeof value === "string" ? value.trim() : "";
    return v === "" ? undefined : v;
  })
  .refine(
    (value) =>
      value === undefined || z.string().email().safeParse(value).success,
    { message: "Enter a valid email address" }
  );

const optionalNonNegativeInt = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return typeof value === "number" ? value : Number(value);
  })
  .refine(
    (value) => value === undefined || (Number.isInteger(value) && value >= 0),
    { message: "Enter a valid whole number" }
  );

const optionalNonNegativeNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return typeof value === "number" ? value : Number(value);
  })
  .refine(
    (value) => value === undefined || (Number.isFinite(value) && value >= 0),
    { message: "Enter a valid amount" }
  );

// Required text: also tolerate null (absent field) and produce a clear message.
const requiredText = (max: number, label: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : ""))
    .refine((value) => value.length >= 1, { message: `${label} is required` })
    .refine((value) => value.length <= max, {
      message: `${label} is too long`,
    });

export const leadInputSchema = z.object({
  name: requiredText(120, "Name"),
  email: optionalEmail,
  phone: optionalText(40, "Phone"),
  company: requiredText(120, "Company"),
  jobTitle: optionalText(120, "Job title"),
  industry: optionalText(80, "Industry"),
  companySize: optionalNonNegativeInt,
  budget: optionalNonNegativeNumber,
  timeline: optionalText(80, "Timeline"),
  requirement: requiredText(2000, "Requirement"),
  painPoint: optionalText(2000, "Pain point"),
});

/** Output type (after transforms) used by services. */
export type LeadInputValues = z.infer<typeof leadInputSchema>;

/** Input type (raw form values) accepted by the schema. */
export type LeadFormValues = z.input<typeof leadInputSchema>;
