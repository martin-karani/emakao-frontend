"use client";

import * as React from "react";
import {
  Building2,
  LayoutDashboard,
  FileText,
  Wrench,
  CreditCard,
  Home,
  Settings2,
  Users,
  Bell,
  BarChart3,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProperties } from "@/components/nav-properties";
import { NavUser } from "@/components/nav-user";
import { AgencySwitcher } from "@/components/agency-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAuth, useProperties } from "@/hooks";

/** Main collapsible navigation groups - usually static or based on permissions */
const NAV_MAIN = [
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
    title: "Properties",
    url: "/properties",
    icon: Building2,
    items: [
      { title: "All Properties", url: "/properties" },
      { title: "Add Property", url: "/properties/new" },
      { title: "Units", url: "/properties/units" },
    ],
  },
  {
    title: "Leases & Tenants",
    url: "/leases",
    icon: FileText,
    items: [
      { title: "Active Leases", url: "/leases" },
      { title: "Tenants", url: "/leases/tenants" },
      { title: "Renewals", url: "/leases/renewals" },
      { title: "Move-outs", url: "/leases/move-outs" },
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
      { title: "Notifications", url: "/settings/notifications" },
      { title: "Billing", url: "/settings/billing" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { data: properties } = useProperties({ limit: 5 });

  const mappedUser = user
    ? {
        name: user.email?.split("@")[0] ?? "User",
        email: user.email ?? user.phone ?? "",
        avatar: "",
        role: user.role,
      }
    : {
        name: "Loading...",
        email: "",
        avatar: "",
        role: "",
      };

  const agencies = user
    ? [
        {
          name: user.agency_name,
          logo: Building2,
          staffRole: user.role,
        },
      ]
    : [];

  const pinnedProperties = (properties ?? []).map((p) => ({
    name: p.name,
    url: `/properties/${p.id}`,
    icon: Building2,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Agency switcher in the header */}
      <SidebarHeader>
        <AgencySwitcher agencies={agencies} />
      </SidebarHeader>

      <SidebarContent>
        {/* Collapsible main nav — management sections */}
        <NavMain items={NAV_MAIN} />

        {/* Quick-access pinned properties */}
        {pinnedProperties.length > 0 && (
          <NavProperties properties={pinnedProperties} />
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
