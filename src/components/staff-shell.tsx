"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building03Icon,
  Folder01Icon,
  Home01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { LogoutButton } from "@/components/logout-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { APP_NAME, CONDO_NAME, STAFF_ROLE_LABELS } from "@/lib/constants";
import type { StaffActor } from "@/lib/types";

const NAV = [
  { href: "/dashboard/ocorrencias", label: "Ocorrências", icon: Home01Icon },
  {
    href: "/dashboard/moradores",
    label: "Cadastro de Moradores",
    icon: UserMultipleIcon,
  },
  { href: "/dashboard/categorias", label: "Categorias", icon: Folder01Icon },
];

export function StaffShell({
  staff,
  children,
}: {
  staff: StaffActor;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "240px" } as React.CSSProperties}
    >
      <Sidebar>
        <SidebarHeader className="gap-1 px-4 py-4">
          <p className="font-heading text-lg font-semibold tracking-tight">
            {APP_NAME}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Building03Icon} className="size-3.5" />
            {CONDO_NAME}
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                    >
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="gap-2 p-3">
          <div className="px-2">
            <p className="truncate text-sm font-medium">{staff.name}</p>
            <p className="text-xs text-muted-foreground">
              {STAFF_ROLE_LABELS[staff.role]}
            </p>
          </div>
          <LogoutButton role="staff" />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-heading font-semibold">{APP_NAME}</span>
        </header>
        <div className="mx-auto w-full max-w-[1440px] flex-1 p-4 md:p-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
