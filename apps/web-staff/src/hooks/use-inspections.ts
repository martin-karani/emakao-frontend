// apps/web-staff/src/hooks/use-inspections.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Base fetch helper ─────────────────────────────────────────────────────────

async function proxyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ??
        `Request failed with status ${res.status}`
    );
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const inspectionKeys = {
  all: ["inspections"] as const,
  byProperty: (propertyId: string) =>
    [...inspectionKeys.all, "property", propertyId] as const,
  detail: (inspectionId: string) =>
    [...inspectionKeys.all, "detail", inspectionId] as const,
};

// ── Types ───────────────────────────────────────────────────────────────────

export type InspectionStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type InspectionType = "move_in" | "move_out" | "routine" | "emergency";

export interface InspectionItem {
  area: string;
  condition: string;
  notes?: string;
  photo_urls: string[];
}

export interface Inspection {
  id: string;
  property_id: string;
  unit_id: string;
  agreement_id?: string;
  inspection_type: InspectionType;
  status: InspectionStatus;
  scheduled_at: string;
  completed_at?: string;
  conducted_by?: string;
  items: InspectionItem[];
  summary_notes?: string;
  created_at: string;
  updated_at: string;
}

interface UseInspectionsOptions {
  property_id?: string;
  unit_id?: string;
  agreement_id?: string;
  status?: InspectionStatus;
  inspection_type?: InspectionType;
  limit?: number;
  offset?: number;
}

// ── useInspections — list inspections ────────────────────────────────────────────

export function useInspections(options: UseInspectionsOptions = {}) {
  return useQuery({
    queryKey: [inspectionKeys.all, options],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, value.toString());
        }
      });
      const queryString = params.toString();
      const url = `/api/v1/inspections${queryString ? `?${queryString}` : ""}`;
      return proxyFetch<Inspection[]>(url);
    },
  });
}

// ── useInspection — single inspection ───────────────────────────────────────────

export function useInspection(id: string | undefined) {
  return useQuery({
    queryKey: inspectionKeys.detail(id ?? ""),
    queryFn: () => proxyFetch<Inspection>(`/api/v1/inspections/${id}`),
    enabled: !!id,
  });
}

// ── useCreateInspection ─────────────────────────────────────────────────────

export function useCreateInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: {
      property_id: string;
      unit_id: string;
      agreement_id?: string;
      inspection_type: InspectionType;
      scheduled_at: string;
    }) =>
      proxyFetch<Inspection>(`/api/v1/inspections`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.all });
    },
  });
}

// ── useUpdateInspection ───────────────────────────────────────────────────────

export function useUpdateInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: {
        status?: InspectionStatus;
        scheduled_at?: string;
        completed_at?: string;
        conducted_by?: string | null;
        items?: InspectionItem[];
        summary_notes?: string;
      };
    }) =>
      proxyFetch<Inspection>(`/api/v1/inspections/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(inspectionKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: inspectionKeys.all });
    },
  });
}

// ── useDeleteInspection ──────────────────────────────────────────────────────

export function useDeleteInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      proxyFetch<void>(`/api/v1/inspections/${id}`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: inspectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inspectionKeys.all });
    },
  });
}
