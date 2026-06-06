// apps/web-staff/src/hooks/use-units.ts
//
// TanStack Query hooks for unit CRUD.
//
// The unit endpoints are new (not yet in the OpenAPI schema), so we use raw
// `fetch` through the Next.js proxy at /api/proxy instead of the typed
// `apiClient`.  Once the schema is regenerated after backend deploy, these
// can be migrated to `apiClient.GET(...)` etc.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateUnitsDto, Unit, UpdateUnitDto } from "@emakao/api-types";

// ── Base fetch helper ─────────────────────────────────────────────────────────

async function proxyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    // Try to surface the backend error message
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ??
        `Request failed with status ${res.status}`
    );
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const unitKeys = {
  all: ["units"] as const,
  byProperty: (propertyId: string) =>
    [...unitKeys.all, "property", propertyId] as const,
  detail: (unitId: string) => [...unitKeys.all, "detail", unitId] as const,
};

// ── useUnits — list units for a property ─────────────────────────────────────

export function useUnits(propertyId: string | undefined) {
  return useQuery({
    queryKey: unitKeys.byProperty(propertyId ?? ""),
    queryFn: () => proxyFetch<Unit[]>(`/api/v1/properties/${propertyId}/units`),
    enabled: !!propertyId,
  });
}

// ── useUnit — single unit ─────────────────────────────────────────────────────

export function useUnit(unitId: string | undefined) {
  return useQuery({
    queryKey: unitKeys.detail(unitId ?? ""),
    queryFn: () => proxyFetch<Unit>(`/api/v1/units/${unitId}`),
    enabled: !!unitId,
  });
}

// ── useCreateUnits — batch creation ──────────────────────────────────────────

/**
 * Create one or more units for the given property in a single request.
 * The backend wraps the inserts in a transaction, so the entire batch
 * succeeds or fails atomically.
 */
export function useCreateUnits(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUnitsDto) =>
      proxyFetch<Unit[]>(`/api/v1/properties/${propertyId}/units`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.byProperty(propertyId),
      });
    },
  });
}

// ── useUpdateUnit ─────────────────────────────────────────────────────────────

export function useUpdateUnit(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, dto }: { unitId: string; dto: UpdateUnitDto }) =>
      proxyFetch<Unit>(`/api/v1/units/${unitId}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    onSuccess: (updated) => {
      // Update the detail cache
      queryClient.setQueryData(unitKeys.detail(updated.id), updated);
      // Refresh the property unit list
      queryClient.invalidateQueries({
        queryKey: unitKeys.byProperty(propertyId),
      });
    },
  });
}

// ── useDeleteUnit ─────────────────────────────────────────────────────────────

export function useDeleteUnit(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) =>
      proxyFetch<void>(`/api/v1/units/${unitId}`, { method: "DELETE" }),
    onSuccess: (_data, unitId) => {
      queryClient.removeQueries({ queryKey: unitKeys.detail(unitId) });
      queryClient.invalidateQueries({
        queryKey: unitKeys.byProperty(propertyId),
      });
    },
  });
}
