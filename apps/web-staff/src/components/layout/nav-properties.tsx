"use client";

import {
  Eye,
  Forward,
  MoreHorizontal,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useProperties, useWorkspace } from "@/hooks";

/**
 * "Quick access" pinned properties — shortcuts to individual property pages.
 * Mirrors shadcn's NavProjects but scoped to eMakao's property context.
 */
export function NavProperties({
  properties,
}: {
  properties: {
    id?: string;
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { isMobile } = useSidebar();
  const { data: allProperties } = useProperties();
  const { buildWorkspaceUrl } = useWorkspace(allProperties ?? []);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Pinned Properties</SidebarGroupLabel>
      <SidebarMenu>
        {properties.map((item) => (
          <SidebarMenuItem key={item.id || item.name}>
            <SidebarMenuButton
              render={
                <Link href={buildWorkspaceUrl(item.url, "property", item.id)} />
              }
            >
              <item.icon />
              <span>{item.name}</span>
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                }
              />
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                {/* View Property */}
                <DropdownMenuItem>
                  <Link
                    href={buildWorkspaceUrl(item.url, "property", item.id)}
                    className="flex items-center gap-1.5 w-full"
                  >
                    <Eye className="text-muted-foreground size-4" />
                    <span>View Property</span>
                  </Link>
                </DropdownMenuItem>

                {/* View Leases */}
                <DropdownMenuItem>
                  <Link
                    href={buildWorkspaceUrl("/leases", "property", item.id)}
                    className="flex items-center gap-1.5 w-full"
                  >
                    <Forward className="text-muted-foreground size-4" />
                    <span>View Leases</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Remove Pin — no navigation, just action */}
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="size-4" />
                  <span>Remove Pin</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {/* Add property shortcut */}
        <SidebarMenuItem>
          <SidebarMenuButton
            className="text-sidebar-foreground/70"
            render={<Link href="/properties/new" />}
          >
            <Plus className="text-sidebar-foreground/70" />
            <span>Add Property</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
