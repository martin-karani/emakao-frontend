"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Property } from "@emakao/api-types";

export type WorkspaceMode = "agency" | "property";

const WORKSPACE_MODE_KEY = "emakao:web-staff:workspace-mode";
const PROPERTY_ID_KEY = "emakao:web-staff:property-id";

function readWorkspaceMode(): WorkspaceMode {
  if (typeof window === "undefined") return "agency";
  const value = window.localStorage.getItem(WORKSPACE_MODE_KEY);
  return value === "property" ? "property" : "agency";
}

function readPropertyId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(PROPERTY_ID_KEY) ?? undefined;
}

function subscribeToWorkspaceStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === WORKSPACE_MODE_KEY ||
      event.key === PROPERTY_ID_KEY
    ) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

function getStoredWorkspaceSnapshot() {
  return `${readWorkspaceMode()}::${readPropertyId() ?? ""}`;
}

export function useWorkspace(properties: Property[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── 1. Determine active workspace from URL or Fallback ──────────────────
  const workspaceParam = searchParams.get("w");

  const { mode: urlMode, id: urlId } = React.useMemo(() => {
    if (!workspaceParam) return { mode: undefined, id: undefined };
    if (workspaceParam === "agency")
      return { mode: "agency" as const, id: undefined };
    if (workspaceParam.startsWith("p_")) {
      return { mode: "property" as const, id: workspaceParam.substring(2) };
    }
    return { mode: undefined, id: undefined };
  }, [workspaceParam]);

  // Keep the first render deterministic for SSR hydration. If the URL does not
  // define the workspace, restore the last local preference via an external
  // store snapshot after hydration instead of branching on `window` in render.
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
      propertyId: storedPropertyId || undefined,
    }),
    [storedMode, storedPropertyId],
  );

  // Use URL params if present, otherwise fallback to the restored local state.
  const workspaceMode: WorkspaceMode = urlMode ?? storedWorkspace.mode;
  const activePropertyId = urlId ?? storedWorkspace.propertyId;

  const activeProperty = React.useMemo(
    () => properties.find((p) => p.id === activePropertyId) || properties[0],
    [properties, activePropertyId],
  );

  // ── 2. Sync LocalStorage (Keep it as a "memory" of last selection) ──────
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(WORKSPACE_MODE_KEY, workspaceMode);
    if (workspaceMode === "property" && activePropertyId) {
      window.localStorage.setItem(PROPERTY_ID_KEY, activePropertyId);
    }
  }, [workspaceMode, activePropertyId]);

  // ── 3. Navigation Helpers ───────────────────────────────────────────────
  const buildWorkspaceUrl = React.useCallback(
    (url: string, modeOverride?: WorkspaceMode, idOverride?: string) => {
      const targetMode = modeOverride ?? workspaceMode;
      const targetId = idOverride ?? activePropertyId;

      const baseUrl = url.split("?")[0];
      const existingParams = new URLSearchParams(url.split("?")[1] || "");

      if (targetMode === "agency") {
        existingParams.set("w", "agency");
      } else if (targetId) {
        existingParams.set("w", `p_${targetId}`);
      }

      return `${baseUrl}?${existingParams.toString()}`;
    },
    [workspaceMode, activePropertyId],
  );

  const selectAgencyWorkspace = React.useCallback(() => {
    const newUrl = buildWorkspaceUrl(pathname, "agency");
    router.push(newUrl);
  }, [pathname, router, buildWorkspaceUrl]);

  const selectPropertyWorkspace = React.useCallback(
    (propertyId?: string) => {
      const id = propertyId ?? properties[0]?.id;
      const newUrl = buildWorkspaceUrl(pathname, "property", id);
      router.push(newUrl);
    },
    [pathname, router, properties, buildWorkspaceUrl],
  );

  return {
    workspaceMode,
    activeProperty,
    activePropertyId: activeProperty?.id,
    selectAgencyWorkspace,
    selectPropertyWorkspace,
    buildWorkspaceUrl,
    isAgencyWorkspace: workspaceMode === "agency",
    isPropertyWorkspace: workspaceMode === "property",
  };
}
