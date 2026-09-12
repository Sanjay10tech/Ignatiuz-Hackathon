import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { signup } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
