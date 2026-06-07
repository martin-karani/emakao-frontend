"use client";

import * as React from "react";
import {
  Building2,
  LayoutDashboard,
  Wrench,
  CreditCard,
  Settings2,
  Users,
  Blocks,
  LifeBuoy,
  Send,
  FileText,
} from "lucide-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavSecondary } from "@/components/layout/nav-secondary";
import { NavProperties } from "@/components/layout/nav-properties";
import { NavUser } from "@/components/layout/nav-user";
import { BroadcastNoticeModal } from "@/components/shared/broadcast-notice-modal";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAuth, useProperties, useWorkspace } from "@/hooks";

const AGENCY_NAV = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      { title: "Summary", url: "/dashboard" },
      { title: "Analytics", url: "/dashboard/analytics" },
      { title: "Reports", url: "/dashboard/reports" },
    ],
  },
  {
    title: "Portfolio",
    url: "/properties",
    icon: Building2,
    items: [
      { title: "All Properties", url: "/properties" },
      { title: "Units", url: "/properties/units" },
      { title: "Add Property", url: "/properties/new" },
    ],
  },
  {
    title: "Finance",
    url: "/finance",
    icon: CreditCard,
    items: [
      { title: "Rent Collection", url: "/finance" },
      { title: "Expenses", url: "/finance/expenses" },
      { title: "Bank Statements", url: "/finance/statements" },
      { title: "Invoices", url: "/finance/invoices" },
    ],
  },
  {
    title: "Staff & Roles",
    url: "/staff",
    icon: Users,
    items: [
      { title: "All Staff", url: "/staff" },
      { title: "Invite Staff", url: "/staff/invite" },
      { title: "Roles & Permissions", url: "/staff/roles" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [
      { title: "General", url: "/settings" },
      { title: "Billing", url: "/settings/billing" },
    ],
  },
];

const SECONDARY_NAV = [
  { title: "Integrations", url: "/settings/integrations", icon: Blocks },
  { title: "Support", url: "/support", icon: LifeBuoy },
  { title: "Feedback", url: "/feedback", icon: Send },
];

// `:id` is replaced at runtime with the real activePropertyId.
// All sub-items use real Next.js routes — no more ?tab= query params.
const PROPERTY_NAV_BASE = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      { title: "Summary", url: "/dashboard" },
      { title: "Analytics", url: "/dashboard/analytics" },
    ],
  },
  {
    title: "Property",
    url: "/properties/:id",
    icon: Building2,
    items: [
      { title: "Overview", url: "/properties/:id" },
      { title: "Units", url: "/properties/:id/units" },
      { title: "Leases", url: "/properties/:id/leases" },
      { title: "Team", url: "/properties/:id/team" },
    ],
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
    items: [
      { title: "Work Orders", url: "/maintenance" },
      { title: "Open Requests", url: "/maintenance?status=open" },
      { title: "Vendors", url: "/maintenance/vendors" },
    ],
  },
  {
    title: "Finance",
    url: "/finance",
    icon: CreditCard,
    items: [
      { title: "Rent Collection", url: "/finance" },
      { title: "Expenses", url: "/finance/expenses" },
      { title: "Invoices", url: "/finance/invoices" },
    ],
  },
  {
    title: "Documents",
    url: "/leases",
    icon: FileText,
    items: [
      { title: "All Leases", url: "/leases" },
      { title: "Renewals", url: "/leases/renewals" },
      { title: "Move-outs", url: "/leases/move-outs" },
    ],
  },
  {
    title: "Settings",
    url: "/properties/:id/settings",
    icon: Settings2,
    items: [
      { title: "Property Settings", url: "/properties/:id/settings" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading: isUserLoading } = useAuth();
  const { data: properties, isLoading: isPropertiesLoading } = useProperties({
    limit: 10,
  });
  const {
    workspaceMode,
    activeProperty,
    activePropertyId,
    selectAgencyWorkspace,
    selectPropertyWorkspace,
    isAgencyWorkspace,
  } = useWorkspace(properties ?? []);

  const mappedUser = React.useMemo(() => {
    if (!user) {
      return {
        name: isUserLoading ? "Loading..." : "Guest User",
        email: isUserLoading ? "Please wait..." : "",
        avatar: "",
        role: isUserLoading ? "Authenticating..." : "",
      };
    }
    return {
      name: user.email?.split("@")[0] ?? "User",
      email: user.email ?? user.phone ?? "",
      avatar: "",
      role: user.role,
    };
  }, [user, isUserLoading]);

  const pinnedProperties = (properties ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    url: "/properties",
    icon: Building2,
  }));

  const navItems = React.useMemo(() => {
    if (isAgencyWorkspace) return AGENCY_NAV;

    // Replace every `:id` placeholder with the real activePropertyId.
    return PROPERTY_NAV_BASE.map((item) => ({
      ...item,
      url: item.url.replace(":id", activePropertyId ?? ""),
      items: item.items?.map((sub) => ({
        ...sub,
        url: sub.url.replace(":id", activePropertyId ?? ""),
      })),
    }));
  }, [isAgencyWorkspace, activePropertyId]);

  const navLabel = isAgencyWorkspace
    ? "Agency Workspace"
    : `${activeProperty?.name ?? "Property"} Workspace`;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher
          properties={properties ?? []}
          agencyName={user?.agency_name}
          isLoading={isUserLoading || isPropertiesLoading}
          workspaceMode={workspaceMode}
          activePropertyId={activePropertyId}
          onSelectAgencyWorkspace={selectAgencyWorkspace}
          onSelectPropertyWorkspace={selectPropertyWorkspace}
        />

        {!isAgencyWorkspace && activeProperty && (
          <div className="mx-2 mb-1 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-primary leading-tight">
                {activeProperty.name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground capitalize">
                {activeProperty.property_type?.replace(/_/g, " ") ?? "Property"}
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} label={navLabel} />

        {isAgencyWorkspace && pinnedProperties.length > 0 && (
          <NavProperties properties={pinnedProperties} />
        )}

        <NavSecondary items={SECONDARY_NAV} className="mt-auto" />

        {!isAgencyWorkspace && activePropertyId && (
          <div className="px-4 py-4 mt-auto border-t border-sidebar-border">
            <BroadcastNoticeModal propertyId={activePropertyId} />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={mappedUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
