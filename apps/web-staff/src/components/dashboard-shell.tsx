"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, CreditCard, FileText, Home, Wrench } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", Icon: Home },
  { href: "/properties", label: "Properties", Icon: Building },
  { href: "/leases", label: "Leases", Icon: FileText },
  { href: "/maintenance", label: "Maintenance", Icon: Wrench },
  { href: "/finance", label: "Finance", Icon: CreditCard },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const activeLabel =
    NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label ??
    "Dashboard";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 flex items-center px-4 border-b">
          <span className="font-bold text-lg tracking-tight text-primary">
            eMakao Workspace
          </span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {NAV_ITEMS.map(({ href, label, Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  render={<Link href={href} />}
                  isActive={pathname.startsWith(href)}
                  tooltip={label}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="h-16 border-b bg-background flex items-center px-6 gap-3 justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <h1 className="text-sm font-medium text-muted-foreground">
              {activeLabel}
            </h1>
          </div>
          {/* User nav dropdown slot */}
        </header>

        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
