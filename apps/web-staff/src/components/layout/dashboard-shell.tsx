"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Search, Bell, User, LogOut, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Breadcrumb config — maps path segments to human-readable labels
// ---------------------------------------------------------------------------
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Overview",
  properties: "Properties",
  leases: "Leases & Tenants",
  maintenance: "Maintenance",
  finance: "Finance",
  staff: "Staff & Roles",
  settings: "Settings",
  new: "New",
  units: "Units",
  team: "Team",
  tenants: "Tenants",
  renewals: "Renewals",
  "move-outs": "Move-outs",
  vendors: "Vendors",
  expenses: "Expenses",
  statements: "Bank Statements",
  invoices: "Invoices",
  invite: "Invite",
  roles: "Roles & Permissions",
  notifications: "Notifications",
  billing: "Billing",
  analytics: "Analytics",
  reports: "Reports",
};

function useSegments(pathname: string) {
  const raw = pathname.split("/").filter(Boolean);
  return raw.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? seg,
    href: "/" + raw.slice(0, i + 1).join("/"),
  }));
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = useSegments(pathname);
  const { user, logout } = useAuth();

  const breadcrumbItems = segments.flatMap((seg, i) => {
    const isLast = i === segments.length - 1;

    return [
      <BreadcrumbItem key={seg.href}>
        {isLast ? (
          <BreadcrumbPage>{seg.label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink href={seg.href} className="hidden md:block">
            {seg.label}
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>,
      ...(!isLast
        ? [
            <BreadcrumbSeparator
              key={`${seg.href}-separator`}
              className="hidden md:block"
            />,
          ]
        : []),
    ];
  });

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* ── Top bar ── */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            {/* Breadcrumb — auto-generated from the current URL */}
            <Breadcrumb>
              <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-muted/50 border-none h-9 focus-visible:ring-1"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex flex-1 flex-col min-w-0">
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 min-w-0">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
