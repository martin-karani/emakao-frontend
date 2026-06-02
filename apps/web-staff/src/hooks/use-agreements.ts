/**
 * @file use-agreements.ts
 *
 * The backend entity is `agreements` — previously called "leases" in older
 * frontend code.  All imports/references should use `Agreement` / `agreements`
 * going forward.
 *
 * Key schema facts:
 *   - Terminate an agreement: POST /api/v1/agreements/{id}/terminate  → 204
 *   - There is NO PATCH .../status endpoint; termination is the only status
 *     mutation exposed by the API.
 *   - AgreementStatus values (from schema):
 *     "draft" | "pendingsignature" | "active" | "expired" |
 *     "terminated" | "pendingrenewal" | "renewed"
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@emakao/api-client";
import type { Agreement, AgreementStatus } from "@emakao/api-types";

interface UseAgreementsOptions {
  property_id?: string;
  limit?: number;
  offset?: number;
}

export function useAgreements(options: UseAgreementsOptions = {}) {
  return useQuery({
    queryKey: ["agreements", options],
    queryFn: async (): Promise<Agreement[]> => {
      const { data, error } = await apiClient.GET("/api/v1/agreements", {
        params: {
          query: {
            property_id: options.property_id ?? null,
            limit: options.limit ?? null,
            offset: options.offset ?? null,
          },
        },
      });
      if (error) throw new Error("Failed to fetch agreements");
      return data;
    },
  });
}

export function useAgreement(id: string) {
  return useQuery({
    queryKey: ["agreements", id],
    queryFn: async (): Promise<Agreement> => {
      const { data, error } = await apiClient.GET("/api/v1/agreements/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to fetch agreement");
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Terminate a lease agreement early.
 * POST /api/v1/agreements/{id}/terminate → 204 No Content
 *
 * The backend transitions the status to "terminated".  There is no request
 * body required.  After success the agreements list and any per-property
 * queries are invalidated.
 */
export function useTerminateAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.POST(
        "/api/v1/agreements/{id}/terminate",
        { params: { path: { id } } }
      );
      if (error) throw new Error("Failed to terminate agreement");
    },
    onMutate: async (terminatedId) => {
      await queryClient.cancelQueries({ queryKey: ["agreements"] });
      const snapshot = queryClient.getQueriesData<Agreement[]>({
        queryKey: ["agreements"],
      });

      // Optimistic update: flip status to "terminated" in all list caches
      queryClient.setQueriesData<Agreement[]>(
        { queryKey: ["agreements"] },
        (old) =>
          old?.map((a) =>
            a.id === terminatedId
              ? ({ ...a, status: "terminated" } satisfies Agreement)
              : a
          )
      );
      return { snapshot };
    },
    onError: (_err, _id, context) => {
      context?.snapshot.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: (_, __, terminatedId) => {
      queryClient.invalidateQueries({ queryKey: ["agreements"] });
      // Unit occupancy shown on properties/work-orders may have changed
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      // Invalidate the specific agreement detail cache too
      queryClient.invalidateQueries({ queryKey: ["agreements", terminatedId] });
    },
  });
}

// ── Convenience type re-export so call sites don't need two imports ───────────
export type { Agreement, AgreementStatus };
