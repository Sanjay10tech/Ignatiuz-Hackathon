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

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine(
    (value) => value === undefined || z.string().email().safeParse(value).success,
    { message: "Enter a valid email address" }
  );

const optionalNonNegativeInt = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "" || value === null) return undefined;
    return typeof value === "number" ? value : Number(value);
  })
  .refine(
    (value) =>
      value === undefined || (Number.isInteger(value) && value >= 0),
    { message: "Enter a valid whole number" }
  );

const optionalNonNegativeNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "" || value === null) return undefined;
    return typeof value === "number" ? value : Number(value);
  })
  .refine(
    (value) => value === undefined || (Number.isFinite(value) && value >= 0),
    { message: "Enter a valid amount" }
  );

export const leadInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: optionalEmail,
  phone: optionalText(40),
  company: z
    .string()
    .trim()
    .min(1, "Company is required")
    .max(120, "Company name is too long"),
  jobTitle: optionalText(120),
  industry: optionalText(80),
  companySize: optionalNonNegativeInt,
  budget: optionalNonNegativeNumber,
  timeline: optionalText(80),
  requirement: z
    .string()
    .trim()
    .min(1, "Requirement is required")
    .max(2000, "Requirement is too long"),
  painPoint: optionalText(2000),
});

/** Output type (after transforms) used by services. */
export type LeadInputValues = z.infer<typeof leadInputSchema>;

/** Input type (raw form values) accepted by the schema. */
export type LeadFormValues = z.input<typeof leadInputSchema>;
