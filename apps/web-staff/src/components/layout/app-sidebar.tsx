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
  {
    title: "Integrations",
    url: "/settings/integrations",
    icon: Blocks,
  },
  {
    title: "Support",
    url: "/support",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "/feedback",
    icon: Send,
  },
];

const PROPERTY_NAV = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      { title: "Summary", url: "/dashboard" },
      { title: "Performance", url: "/dashboard" },
    ],
  },
  {
    title: "Operations",
    url: "/properties",
    icon: Building2,
    items: [
      { title: "Property Profile", url: "/properties" },
      { title: "Units", url: "/properties/units" },
      { title: "Leases", url: "/leases" },
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
    title: "Agency",
    url: "/settings",
    icon: Settings2,
    items: [
      { title: "Agency Overview", url: "/dashboard" },
      { title: "Settings", url: "/settings" },
      { title: "Notifications", url: "/properties" },
      { title: "Billing", url: "/properties" },
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

    return PROPERTY_NAV.map((item) => {
      if (item.title === "Agency") {
        return {
          ...item,
          items: item.items?.map((sub) => {
            if (sub.title === "Notifications") {
              return {
                ...sub,
                url: `/properties/${activePropertyId}?tab=notifications`,
              };
            }
            if (sub.title === "Billing") {
              return {
                ...sub,
                url: `/properties/${activePropertyId}?tab=billing`,
              };
            }
            return sub;
          }),
        };
      }
      return item;
    });
  }, [isAgencyWorkspace, activePropertyId]);

  const navLabel = isAgencyWorkspace
    ? "Agency Workspace"
    : `${activeProperty?.name ?? "Property"} Workspace`;

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Workspace switcher in the header */}
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

      {/* Logged-in staff user menu */}
      <SidebarFooter>
        <NavUser user={mappedUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
