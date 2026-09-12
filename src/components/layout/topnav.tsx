"use client";

import { usePathname } from "next/navigation";
import { Search, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PRIMARY_NAV } from "@/lib/constants";
import { signOut } from "@/app/(auth)/actions";

function currentTitle(pathname: string) {
  if (pathname === "/leads/new") return "Add Lead";
  const match = [...PRIMARY_NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
  return match?.title ?? "LeadIQ";
}

export function TopNav({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  const title = currentTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search leads"
            aria-label="Search leads"
            className="h-9 w-56 rounded-md border border-input bg-transparent pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {userEmail ? (
          <span className="hidden text-sm text-muted-foreground lg:inline">
            {userEmail}
          </span>
        ) : null}

        <form action={signOut} className="md:hidden">
          <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
