"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/env";
import type { AuthFormState } from "@/app/(auth)/actions";

type AuthAction = (
  state: AuthFormState,
  formData: FormData
) => Promise<AuthFormState>;

interface AuthFormProps {
  mode: "login" | "signup";
  action: AuthAction;
}

const COPY = {
  login: {
    title: "Sign in",
    description: "Enter your credentials to access your workspace.",
    submit: "Sign in",
    switchText: "Don't have an account?",
    switchHref: "/signup",
    switchLabel: "Create one",
    autoComplete: "current-password",
  },
  signup: {
    title: "Create account",
    description: "Start qualifying leads in minutes.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchHref: "/login",
    switchLabel: "Sign in",
    autoComplete: "new-password",
  },
} as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const copy = COPY[mode];
  const configured = isSupabaseConfigured();
  const [state, formAction] = useFormState<AuthFormState, FormData>(action, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={!configured}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={copy.autoComplete}
              required
              disabled={!configured}
            />
            {mode === "signup" ? (
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters.
              </p>
            ) : null}
          </div>

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
              className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-foreground"
            >
              Authentication is not configured yet. Set the Supabase environment
              variables to enable sign in.
            </div>
          ) : null}

          <SubmitButton label={copy.submit} />
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {copy.switchText}{" "}
          <Link
            href={copy.switchHref}
            className="font-medium text-primary hover:underline"
          >
            {copy.switchLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
