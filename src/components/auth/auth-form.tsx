"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
    title: "Welcome back",
    description: "Sign in to your LeadIQ workspace.",
    submit: "Sign in",
    switchText: "Don't have an account?",
    switchHref: "/signup",
    switchLabel: "Create one",
    autoComplete: "current-password",
  },
  signup: {
    title: "Create your account",
    description: "Start qualifying leads with AI in minutes.",
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
    <Button
      type="submit"
      className="group w-full"
      size="lg"
      disabled={pending}
    >
      {pending ? (
        "Please wait…"
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </>
      )}
    </Button>
  );
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const copy = COPY[mode];
  const configured = isSupabaseConfigured();
  const [state, formAction] = useFormState<AuthFormState, FormData>(action, {});
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Card className="panel-elevated animate-fade-up overflow-hidden">
      <div className="h-1 w-full brand-gradient" aria-hidden="true" />
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl tracking-tight">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                disabled={!configured}
                className={cn(
                  "flex h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm transition-colors",
                  "placeholder:text-muted-foreground hover:border-primary/40",
                  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={copy.autoComplete}
                placeholder="••••••••"
                required
                disabled={!configured}
                className={cn(
                  "flex h-11 w-full rounded-md border border-input bg-background pl-9 pr-10 text-sm shadow-sm transition-colors",
                  "placeholder:text-muted-foreground hover:border-primary/40",
                  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={!configured}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {mode === "signup" ? (
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters.
              </p>
            ) : null}
          </div>

          {state.error ? (
            <div
              role="alert"
              className="animate-fade-in flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground"
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

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {copy.switchText}{" "}
          <Link
            href={copy.switchHref}
            className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            {copy.switchLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
