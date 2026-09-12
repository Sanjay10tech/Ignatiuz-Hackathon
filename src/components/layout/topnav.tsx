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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search leads"
            aria-label="Search leads"
            className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground transition-colors hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        {userEmail ? (
          <div className="hidden items-center gap-2 lg:flex">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary"
              aria-hidden="true"
            >
              {userEmail.slice(0, 2)}
            </span>
            <span className="text-sm text-muted-foreground">{userEmail}</span>
          </div>
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
