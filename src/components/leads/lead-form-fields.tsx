"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Lead } from "@/types";

export type LeadFieldErrors = Record<string, string>;

interface LeadFormFieldsProps {
  disabled?: boolean;
  errors?: LeadFieldErrors;
  /** Prefilled values when editing an existing lead. */
  defaults?: Partial<Lead>;
}

/**
 * Shared set of lead form fields, used by both the Add and Edit forms. Fields
 * are uncontrolled (defaultValue) so the same markup serves create and edit.
 */
export function LeadFormFields({
  disabled = false,
  errors = {},
  defaults,
}: LeadFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" required error={errors.name}>
          <Input
            id="name"
            name="name"
            defaultValue={defaults?.name ?? ""}
            disabled={disabled}
          />
        </Field>

        <Field id="company" label="Company" required error={errors.company}>
          <Input
            id="company"
            name="company"
            defaultValue={defaults?.company ?? ""}
            disabled={disabled}
          />
        </Field>

        <Field id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaults?.email ?? ""}
            disabled={disabled}
          />
        </Field>

        <Field id="jobTitle" label="Job title" error={errors.jobTitle}>
          <Input
            id="jobTitle"
            name="jobTitle"
            defaultValue={defaults?.jobTitle ?? ""}
            disabled={disabled}
          />
        </Field>

        <Field id="industry" label="Industry" error={errors.industry}>
          <Input
            id="industry"
            name="industry"
            defaultValue={defaults?.industry ?? ""}
            disabled={disabled}
          />
        </Field>

        <Field id="budget" label="Budget" error={errors.budget}>
          <Input
            id="budget"
            name="budget"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            placeholder="e.g. 50000"
            defaultValue={defaults?.budget ?? ""}
            disabled={disabled}
          />
        </Field>

        <Field id="timeline" label="Timeline" error={errors.timeline}>
          <Input
            id="timeline"
            name="timeline"
            placeholder="e.g. Q3, next 30 days"
            defaultValue={defaults?.timeline ?? ""}
            disabled={disabled}
          />
        </Field>
      </div>

      <Field id="requirement" label="Requirement" required error={errors.requirement}>
        <Textarea
          id="requirement"
          name="requirement"
          rows={3}
          placeholder="What is the lead trying to achieve?"
          defaultValue={defaults?.requirement ?? ""}
          disabled={disabled}
        />
      </Field>

      <Field id="painPoint" label="Pain point" error={errors.painPoint}>
        <Textarea
          id="painPoint"
          name="painPoint"
          rows={3}
          placeholder="What problem are they trying to solve?"
          defaultValue={defaults?.painPoint ?? ""}
          disabled={disabled}
        />
      </Field>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
