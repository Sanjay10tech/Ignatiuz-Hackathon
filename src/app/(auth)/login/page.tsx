import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
