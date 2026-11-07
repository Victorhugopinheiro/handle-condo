"use client";

import { useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { logoutResidentAction, logoutStaffAction } from "@/lib/auth-actions";

export function LogoutButton({ role }: { role: "staff" | "resident" }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          if (role === "staff") {
            await logoutStaffAction();
          } else {
            await logoutResidentAction();
          }
        });
      }}
    >
      <HugeiconsIcon icon={Logout03Icon} data-icon="inline-start" />
      Sair
    </Button>
  );
}
