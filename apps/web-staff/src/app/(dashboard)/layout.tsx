"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useProperties, useWorkspace } from "@/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: properties } = useProperties();
  const { workspaceMode, activePropertyId } = useWorkspace(properties ?? []);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to include workspace param if missing
  useEffect(() => {
    if (!searchParams.has("w")) {
      const workspace =
        workspaceMode === "agency" ? "agency" : `p_${activePropertyId}`;
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("w", workspace);
      router.replace(`${pathname}?${newParams.toString()}`);
    }
  }, [searchParams, workspaceMode, activePropertyId, pathname, router]);

  return <DashboardShell>{children}</DashboardShell>;
}
