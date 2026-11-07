import Link from "next/link";
import { APP_NAME, CONDO_NAME } from "@/lib/constants";
import type { ResidentActor } from "@/lib/types";
import { LogoutButton } from "@/components/logout-button";

export function ResidentShell({
  resident,
  children,
}: {
  resident: ResidentActor;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <Link
              href="/ocorrencias"
              className="font-heading text-lg font-semibold"
            >
              {APP_NAME}
            </Link>
            <p className="text-xs text-muted-foreground">{CONDO_NAME}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{resident.name}</p>
              <p className="text-xs text-muted-foreground">{resident.unit}</p>
            </div>
            <LogoutButton role="resident" />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
