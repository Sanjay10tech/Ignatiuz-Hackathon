"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAME, APP_TAGLINE, PRIMARY_NAV } from "@/lib/constants";
import { signOut } from "@/app/(auth)/actions";

/**
 * Determine whether a nav item is active. Exact match for the base route,
 * prefix match for nested routes (so /leads/new keeps /leads inactive but
 * highlights the correct top-level section only when appropriate).
 */
function isActive(pathname: string, href: string) {
  if (href === "/leads") {
    // Keep "Leads" and "Add Lead" distinct in the nav.
    return pathname === "/leads";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Primary">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        {userEmail ? (
          <p
            className="truncate px-2 pb-2 text-xs text-muted-foreground"
            title={userEmail}
          >
            {userEmail}
          </p>
        ) : null}
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
