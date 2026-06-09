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
  UserCheck,
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

function buildAgencyNav(agencySlug: string) {
  const p = (path: string) => `/${agencySlug}${path}`;
  return [
    {
      title: "Overview",
      url: p("/dashboard"),
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Summary", url: p("/dashboard") },
        { title: "Analytics", url: p("/dashboard/analytics") },
        { title: "Reports", url: p("/dashboard/reports") },
      ],
    },
    {
      title: "Portfolio",
      url: p("/properties"),
      icon: Building2,
      items: [
        { title: "All Properties", url: p("/properties") },
        { title: "Units", url: p("/properties/units") },
        { title: "Add Property", url: p("/properties/new") },
      ],
    },
    {
      title: "Maintenance",
      url: p("/maintenance"),
      icon: Wrench,
      items: [
        { title: "All Work Orders", url: p("/maintenance") },
        { title: "Vendors", url: p("/maintenance/vendors") },
      ],
    },
    {
      title: "Finance",
      url: p("/finance"),
      icon: CreditCard,
      items: [
        { title: "Rent Collection", url: p("/finance") },
        { title: "Expenses", url: p("/finance/expenses") },
        { title: "Bank Statements", url: p("/finance/statements") },
        { title: "Invoices", url: p("/finance/invoices") },
      ],
    },
    {
      title: "Staff & Roles",
      url: p("/staff"),
      icon: Users,
      items: [
        { title: "All Staff", url: p("/staff") },
        { title: "Invite Staff", url: p("/staff/invite") },
        { title: "Roles & Permissions", url: p("/staff/roles") },
      ],
    },
    {
      title: "Settings",
      url: p("/settings"),
      icon: Settings2,
      items: [
        { title: "General", url: p("/settings") },
        { title: "Billing", url: p("/settings/billing") },
      ],
    },
  ];
}

function buildSecondaryNav(agencySlug: string) {
  const p = (path: string) => `/${agencySlug}${path}`;
  return [
    { title: "Integrations", url: p("/settings/integrations"), icon: Blocks },
    { title: "Support", url: p("/support"), icon: LifeBuoy },
    { title: "Feedback", url: p("/feedback"), icon: Send },
  ];
}

function buildPropertyNav(agencySlug: string, propertySlug: string) {
  const base = `/${agencySlug}/properties/${propertySlug}`;
  return [
    {
      title: "Overview",
      url: base,
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Summary", url: base },
        { title: "Analytics", url: `${base}/analytics` },
      ],
    },
    {
      title: "Portfolio",
      url: `/${agencySlug}/properties`,
      icon: Building2,
      items: [
        { title: "Units", url: `${base}/units` },
        { title: "Tenants", url: `${base}/tenants` },
        { title: "Leases", url: `${base}/leases` },
        { title: "Team", url: `${base}/team` },
      ],
    },
    {
      title: "Maintenance",
      url: `${base}/maintenance`,
      icon: Wrench,
      items: [{ title: "Work Orders", url: `${base}/maintenance` }],
    },
    {
      title: "Finance",
      url: `${base}/finance`,
      icon: CreditCard,
      items: [
        { title: "Rent Collection", url: `${base}/finance` },
        { title: "Expenses", url: `${base}/finance/expenses` },
        { title: "Invoices", url: `${base}/finance/invoices` },
      ],
    },
    {
      title: "Documents",
      url: `${base}/leases`,
      icon: FileText,
      items: [
        { title: "All Leases", url: `${base}/leases` },
        { title: "Renewals", url: `${base}/leases/renewals` },
        { title: "Move-outs", url: `${base}/leases/move-outs` },
      ],
    },
    {
      title: "Settings",
      url: `${base}/settings`,
      icon: Settings2,
      items: [{ title: "Property Settings", url: `${base}/settings` }],
    },
  ];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading: isUserLoading } = useAuth();
  const { data: properties, isLoading: isPropertiesLoading } = useProperties({
    limit: 10,
  });
  const {
    workspaceMode,
    activeProperty,
    activePropertyId,
    agencySlug: workspaceAgencySlug,
    activePropertySlug,
    selectAgencyWorkspace,
    selectPropertyWorkspace,
    isAgencyWorkspace,
  } = useWorkspace(properties ?? []);
  const agencySlug = user?.agency_slug ?? workspaceAgencySlug ?? "";

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
    slug: p.slug,
    url: `/${agencySlug}/properties/${p.slug}`,
    icon: Building2,
  }));

  const navItems = React.useMemo(() => {
    if (!agencySlug) return [];
    if (isAgencyWorkspace) return buildAgencyNav(agencySlug);

    const propertySlug = activeProperty?.slug ?? activePropertySlug ?? "";
    if (!propertySlug) return buildAgencyNav(agencySlug);
    return buildPropertyNav(agencySlug, propertySlug);
  }, [activeProperty?.slug, activePropertySlug, agencySlug, isAgencyWorkspace]);

  const navLabel = isAgencyWorkspace
    ? "Agency Workspace"
    : `${activeProperty?.name ?? "Property"} Workspace`;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher
          properties={properties ?? []}
          agencyName={user?.agency_name}
          agencySlug={agencySlug}
          isLoading={isUserLoading || isPropertiesLoading}
          workspaceMode={workspaceMode}
          activePropertySlug={activeProperty?.slug ?? activePropertySlug}
          onSelectAgencyWorkspace={selectAgencyWorkspace}
          onSelectPropertyWorkspace={selectPropertyWorkspace}
        />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} label={navLabel} />

        {isAgencyWorkspace && pinnedProperties.length > 0 && (
          <NavProperties
            properties={pinnedProperties}
            addPropertyUrl={`/${agencySlug}/properties/new`}
          />
        )}

        <NavSecondary
          items={agencySlug ? buildSecondaryNav(agencySlug) : []}
          className="mt-auto"
        />

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
