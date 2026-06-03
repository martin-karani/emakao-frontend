"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

/**
 * AgencySwitcher — replaces TeamSwitcher.
 *
 * In eMakao's multi-tenant model each "agency" is a workspace (tenant).
 * Staff may belong to multiple agencies; this switcher lets them switch context.
 */
export function AgencySwitcher({
  agencies,
}: {
  agencies: {
    name: string;
    logo: React.ElementType;
    /** e.g. "Owner", "Property Manager", "Finance Officer" */
    staffRole: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeAgency, setActiveAgency] = React.useState(agencies[0]);

  if (!activeAgency) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <activeAgency.logo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeAgency.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activeAgency.staffRole}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            }
          />

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Agencies
            </DropdownMenuLabel>

            {agencies.map((agency, index) => (
              <DropdownMenuItem
                key={agency.name}
                onClick={() => setActiveAgency(agency)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <agency.logo className="size-3.5 shrink-0" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">{agency.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {agency.staffRole}
                  </span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* "Add Property" — navigates to property creation */}
            <DropdownMenuItem className="gap-2 p-2">
              <Link
                href="/properties/new"
                className="flex items-center gap-2 w-full"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add Property
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** Default logo icon when no custom logo is set for an agency */
export { Building2 as DefaultAgencyLogo };
