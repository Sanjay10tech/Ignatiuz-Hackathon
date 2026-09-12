import { Sidebar } from "./sidebar";
import { TopNav } from "./topnav";

/**
 * Application shell: fixed sidebar, top navigation, and a scrollable main
 * content area. Wraps all authenticated app routes.
 */
export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | null;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userEmail={userEmail} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav userEmail={userEmail} />
        <main className="app-canvas flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
