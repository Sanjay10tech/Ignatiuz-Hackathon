import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // Middleware already guards these routes; this is a defense-in-depth check
  // that also gives us the user identity for the shell.
  const {
    data: { user },
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!user) {
    redirect("/login");
  }

  return (
    <ToastProvider>
      <AppShell userEmail={user.email ?? null}>{children}</AppShell>
    </ToastProvider>
  );
}
