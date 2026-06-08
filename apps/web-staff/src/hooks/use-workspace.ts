"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import type { PropertySummary } from "@emakao/api-types";

export type WorkspaceMode = "agency" | "property";

const WORKSPACE_MODE_KEY = "emakao:web-staff:workspace-mode";
const PROPERTY_SLUG_KEY = "emakao:web-staff:property-slug";
const AGENCY_ROUTE_EXCEPTIONS = new Set(["new", "units"]);

function readStoredPropertySlug() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(PROPERTY_SLUG_KEY) ?? undefined;
}

function readClientCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const cookies = document.cookie.split(";").map((entry) => entry.trim());
  const match = cookies.find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

function parseWorkspacePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const agencySlug = segments[0];

  if (!agencySlug) {
    return {
      agencySlug: undefined,
      workspaceMode: "agency" as WorkspaceMode,
      propertySlug: undefined,
    };
  }

  const isPropertyWorkspace =
    segments[1] === "properties" &&
    segments.length >= 3 &&
    !AGENCY_ROUTE_EXCEPTIONS.has(segments[2]);

  return {
    agencySlug,
    workspaceMode: isPropertyWorkspace ? ("property" as const) : ("agency" as const),
    propertySlug: isPropertyWorkspace ? segments[2] : undefined,
  };
}

function subscribeToWorkspaceStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === WORKSPACE_MODE_KEY ||
      event.key === PROPERTY_SLUG_KEY
    ) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

function getStoredWorkspaceSnapshot() {
  const mode =
    typeof window === "undefined"
      ? "agency"
      : (window.localStorage.getItem(WORKSPACE_MODE_KEY) ?? "agency");
  return `${mode}::${readStoredPropertySlug() ?? ""}`;
}

export function useWorkspace(properties: PropertySummary[]) {
  const router = useRouter();
  const pathname = usePathname();
  const storedWorkspaceSnapshot = React.useSyncExternalStore(
    subscribeToWorkspaceStorage,
    getStoredWorkspaceSnapshot,
    () => "agency::",
  );
  const [storedMode, storedPropertyId = ""] =
    storedWorkspaceSnapshot.split("::");
  const storedWorkspace = React.useMemo(
    () => ({
      mode:
        storedMode === "property"
          ? ("property" as WorkspaceMode)
          : ("agency" as WorkspaceMode),
      propertySlug: storedPropertyId || undefined,
    }),
    [storedMode, storedPropertyId],
  );

  const pathWorkspace = React.useMemo(() => parseWorkspacePath(pathname), [pathname]);
  const cookieAgencySlug = readClientCookie("active_agency_slug");
  const agencySlug = pathWorkspace.agencySlug ?? cookieAgencySlug;
  const activePropertySlug = pathWorkspace.propertySlug ?? storedWorkspace.propertySlug;
  const workspaceMode = pathWorkspace.workspaceMode;

  const activeProperty = React.useMemo(
    () =>
      properties.find(
        (property) =>
          property.slug === activePropertySlug || property.id === activePropertySlug,
      ) || properties[0],
    [properties, activePropertySlug],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(WORKSPACE_MODE_KEY, workspaceMode);
    if (workspaceMode === "property" && activePropertySlug) {
      window.localStorage.setItem(PROPERTY_SLUG_KEY, activePropertySlug);
    }
  }, [workspaceMode, activePropertySlug]);

  const buildAgencyUrl = React.useCallback(
    (path: string) => {
      if (!agencySlug) return path;
      const normalized = path.startsWith("/") ? path : `/${path}`;
      return `/${agencySlug}${normalized}`;
    },
    [agencySlug],
  );

  const buildPropertyUrl = React.useCallback(
    (propertySlug: string, suffix = "") => {
      const base = buildAgencyUrl(`/properties/${propertySlug}`);
      if (!suffix) return base;
      const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
      return `${base}${normalized}`;
    },
    [buildAgencyUrl],
  );

  const selectAgencyWorkspace = React.useCallback(() => {
    router.push(buildAgencyUrl("/dashboard"));
  }, [buildAgencyUrl, router]);

  const selectPropertyWorkspace = React.useCallback(
    (propertySlug?: string) => {
      const targetSlug =
        propertySlug ??
        activeProperty?.slug ??
        storedWorkspace.propertySlug ??
        properties[0]?.slug;
      if (!targetSlug) return;
      router.push(buildPropertyUrl(targetSlug));
    },
    [activeProperty?.slug, buildPropertyUrl, properties, router, storedWorkspace.propertySlug],
  );

  return {
    agencySlug,
    workspaceMode,
    activeProperty,
    activePropertyId: activeProperty?.id,
    activePropertySlug: activeProperty?.slug ?? activePropertySlug,
    selectAgencyWorkspace,
    selectPropertyWorkspace,
    buildAgencyUrl,
    buildPropertyUrl,
    isAgencyWorkspace: workspaceMode === "agency",
    isPropertyWorkspace: workspaceMode === "property",
  };
}
