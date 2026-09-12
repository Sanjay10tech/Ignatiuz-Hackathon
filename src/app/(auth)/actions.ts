"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/validation/auth";

/** Shape returned to auth forms so they can render field/general errors. */
export type AuthFormState = {
  error?: string;
};

const NOT_CONFIGURED =
  "Authentication is not configured. Set Supabase environment variables.";

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = createClient();
  if (!supabase) {
    return { error: NOT_CONFIGURED };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error("[auth.login]", error.status, error.message);
    // Avoid leaking whether an account exists; keep the message generic.
    return { error: "Invalid email or password." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = createClient();
  if (!supabase) {
    return { error: NOT_CONFIGURED };
  }

  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    console.error("[auth.signup]", error.status, error.message);
    return {
      error: error.message || "Could not create your account. Please try again.",
    };
  }

  // When email confirmation is enabled, no session is returned yet.
  if (!data.session) {
    return {
      error:
        "Check your email to confirm your account, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
