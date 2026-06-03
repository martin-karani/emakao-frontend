"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
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

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* ── Top bar ── */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            {/* Breadcrumb — auto-generated from the current URL */}
            <Breadcrumb>
              <BreadcrumbList>
                {segments.map((seg, i) => {
                  const isLast = i === segments.length - 1;
                  return (
                    <BreadcrumbItem key={seg.href}>
                      {isLast ? (
                        <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink
                            href={seg.href}
                            className="hidden md:block"
                          >
                            {seg.label}
                          </BreadcrumbLink>
                          <BreadcrumbSeparator className="hidden md:block" />
                        </>
                      )}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* ── Page content ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
