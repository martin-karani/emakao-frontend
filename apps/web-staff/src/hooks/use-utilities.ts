// apps/web-staff/src/hooks/use-utilities.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

async function proxyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ??
        `Request failed with status ${res.status}`,
    );
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type MeterType = "water" | "electricity" | "gas";
export type BillingMode = "prepaid" | "postpaid";
export type UtilityBillStatus = "draft" | "issued" | "paid" | "overdue";

export interface UtilityMeter {
  id: string;
  unit_id: string;
  meter_type: MeterType;
  billing_mode: BillingMode;
  meter_number: string;
  rate_per_unit: number;
  created_at: string;
}

export interface UtilityBill {
  id: string;
  meter_id: string;
  unit_id: string;
  units_consumed: number;
  amount_kes: number;
  status: UtilityBillStatus;
  created_at: string;
}

// ── Query Keys ────────────────────────────────────────────────────────────────

export const UTILITY_KEYS = {
  meters: (unitId: string) => ["utility-meters", unitId] as const,
  bills: (unitId: string) => ["utility-bills", unitId] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useMeters(unitId: string | undefined) {
  return useQuery({
    queryKey: UTILITY_KEYS.meters(unitId ?? ""),
    queryFn: async () => {
      if (!unitId) return [];
      return proxyFetch<UtilityMeter[]>(`/api/v1/meters?unit_id=${unitId}`);
    },
    enabled: !!unitId,
  });
}

export function useBills(unitId: string | undefined) {
  return useQuery({
    queryKey: UTILITY_KEYS.bills(unitId ?? ""),
    queryFn: async () => {
      if (!unitId) return [];
      return proxyFetch<UtilityBill[]>(
        `/api/v1/utility-bills?unit_id=${unitId}`,
      );
    },
    enabled: !!unitId,
  });
}

export function useCreateMeter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      unit_id: string;
      meter_type: MeterType;
      billing_mode: BillingMode;
      meter_number: string;
      rate_per_unit: number;
    }) =>
      proxyFetch<UtilityMeter>("/api/v1/meters", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: UTILITY_KEYS.meters(variables.unit_id),
      });
    },
  });
}

export function useRecordReading() {
  return useMutation({
    mutationFn: (data: { meter_id: string; reading_value: number }) =>
      proxyFetch<void>(`/api/v1/meters/${data.meter_id}/readings`, {
        method: "POST",
        body: JSON.stringify({ reading_value: data.reading_value }),
      }),
  });
}

export function useGenerateBill() {
  return useMutation({
    mutationFn: (meterId: string) =>
      proxyFetch<UtilityBill>(`/api/v1/meters/${meterId}/bills/generate`, {
        method: "POST",
      }),
  });
}
