import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export default function LeadNotFound() {
  return (
    <div>
      <PageHeader title="Lead not found" />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">This lead does not exist</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              It may have been deleted, or you don&apos;t have access to it.
            </p>
          </div>
          <Link href="/leads" className={buttonVariants({ variant: "outline" })}>
            Back to leads
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
