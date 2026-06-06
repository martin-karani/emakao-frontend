"use client";

import * as React from "react";
import { Building2, ChevronsUpDown, LayoutDashboard, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { type Property } from "@emakao/api-types";
import type { WorkspaceMode } from "@/hooks";

/**
 * Switches between the agency-wide workspace and property-specific workspace.
 */
export function WorkspaceSwitcher({
  properties,
  agencyName,
  isLoading,
  workspaceMode,
  activePropertyId,
  onSelectAgencyWorkspace,
  onSelectPropertyWorkspace,
}: {
  properties: Property[];
  agencyName?: string;
  isLoading?: boolean;
  workspaceMode: WorkspaceMode;
  activePropertyId?: string;
  onSelectAgencyWorkspace: () => void;
  onSelectPropertyWorkspace: (propertyId?: string) => void;
}) {
  const { isMobile } = useSidebar();
  const activeProperty = React.useMemo(
    () => properties.find((property) => property.id === activePropertyId),
    [properties, activePropertyId],
  );
  const currentWorkspaceValue =
    workspaceMode === "agency" ? "agency" : `property:${activePropertyId}`;

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/20 animate-pulse">
              <Building2 className="size-4 text-sidebar-primary/40" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight space-y-1">
              <div className="h-4 w-24 rounded bg-sidebar-primary/10 animate-pulse" />
              <div className="h-3 w-16 rounded bg-sidebar-primary/5 animate-pulse" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activeProperty && properties.length === 0) {
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
                    <LayoutDashboard className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {agencyName ?? "Agency Overview"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Agency Workspace
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
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Workspace
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value="agency">
                  <DropdownMenuRadioItem
                    value="agency"
                    onClick={onSelectAgencyWorkspace}
                  >
                    <LayoutDashboard className="size-4" />
                    <div className="flex flex-col">
                      <span>Agency Overview</span>
                      <span className="text-xs text-muted-foreground">
                        Portfolio, staff, settings, and overall reporting
                      </span>
                    </div>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="gap-2 p-2">
                <Link
                  href="/settings"
                  className="flex w-full items-center gap-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Agency Settings
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-2 p-2">
                <Link
                  href="/properties/new"
                  className="flex w-full items-center gap-2"
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
                  {workspaceMode === "agency" ? (
                    <LayoutDashboard className="size-4" />
                  ) : (
                    <Building2 className="size-4" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {workspaceMode === "agency"
                      ? (agencyName ?? "Agency Overview")
                      : (activeProperty?.name ?? "Select Property")}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {workspaceMode === "agency"
                      ? "Agency Workspace"
                      : (agencyName ?? "Property Workspace")}
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
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspace
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup value={currentWorkspaceValue}>
                <DropdownMenuRadioItem
                  value="agency"
                  onClick={onSelectAgencyWorkspace}
                >
                  <LayoutDashboard className="size-4" />
                  <div className="flex flex-col">
                    <span>Agency Overview</span>
                    <span className="text-xs text-muted-foreground">
                      Portfolio, staff, settings, and overall reporting
                    </span>
                  </div>
                </DropdownMenuRadioItem>
                {properties.map((property) => (
                  <DropdownMenuRadioItem
                    key={property.id}
                    value={`property:${property.id}`}
                    onClick={() => onSelectPropertyWorkspace(property.id)}
                  >
                    <Building2 className="size-4" />
                    <div className="flex flex-col">
                      <span>{property.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {property.city}
                      </span>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2">
              <Link href="/settings" className="flex w-full items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Agency Settings
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-2 p-2">
              <Link
                href="/properties/new"
                className="flex w-full items-center gap-2"
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

export { Building2 as DefaultAgencyLogo };
