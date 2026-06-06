/**
 * @file use-work-orders.ts
 *
 * The backend entity is `work_orders` — previously called "maintenance tickets"
 * in older frontend code.  All imports/references should use `WorkOrder` /
 * `work-orders` going forward.
 *
 * Key schema facts:
 *   - Status update: PATCH /api/v1/work-orders/{id} with UpdateWorkOrderDto
 *     (no dedicated /status sub-route exists)
 *   - WorkOrderStatus values (from schema):
 *     "open" | "inprogress" | "completed" | "cancelled"
 *   - WorkOrderPriority: "low" | "medium" | "high" | "emergency"
 *   - WorkOrderCategory: "plumbing" | "electrical" | "structural" | "hvac" |
 *     "appliance" | "painting" | "cleaning" | "security" |
 *     "landscaping" | "pest_control" | "general"
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@emakao/api-client";
import type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
  WorkOrderReporterType,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
} from "@emakao/api-types";

interface UseWorkOrdersOptions {
  property_id?: string;
  unit_id?: string;
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  category?: WorkOrderCategory;
  reporter_type?: WorkOrderReporterType;
  assigned_caretaker_id?: string;
  reporter_resident_id?: string;
  limit?: number;
  offset?: number;
}

export function useWorkOrders(options: UseWorkOrdersOptions = {}) {
  return useQuery({
    queryKey: ["work-orders", options],
    queryFn: async (): Promise<WorkOrder[]> => {
      const { data, error } = await apiClient.GET("/api/v1/work-orders", {
        params: {
          query: {
            property_id: options.property_id ?? null,
            unit_id: options.unit_id ?? null,
            status: options.status ?? null,
            priority: options.priority ?? null,
            category: options.category ?? null,
            reporter_type: options.reporter_type ?? null,
            assigned_caretaker_id: options.assigned_caretaker_id ?? null,
            reporter_resident_id: options.reporter_resident_id ?? null,
            limit: options.limit ?? null,
            offset: options.offset ?? null,
          },
        },
      });
      if (error) throw new Error("Failed to fetch work orders");
      return data;
    },
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ["work-orders", id],
    queryFn: async (): Promise<WorkOrder> => {
      const { data, error } = await apiClient.GET("/api/v1/work-orders/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to fetch work order");
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Update any mutable field on a work order, including status.
 *
 * PATCH /api/v1/work-orders/{id} with UpdateWorkOrderDto → WorkOrderResponse
 *
 * Pass only the fields that need to change — all UpdateWorkOrderDto fields
 * are optional.  For a simple status transition:
 *
 *   updateWorkOrder.mutate({ id, body: { status: "inprogress" } })
 */
export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: UpdateWorkOrderDto;
    }): Promise<WorkOrder> => {
      const { data, error } = await apiClient.PATCH(
        "/api/v1/work-orders/{id}",
        {
          params: { path: { id } },
          body,
        },
      );
      if (error) throw new Error("Failed to update work order");
      return data;
    },
    onSuccess: (updated) => {
      // Update the specific item in all list caches
      queryClient.setQueriesData<WorkOrder[]>(
        { queryKey: ["work-orders"] },
        (old) => old?.map((w) => (w.id === updated.id ? updated : w)),
      );
      // Update the individual detail cache
      queryClient.setQueryData(["work-orders", updated.id], updated);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    },
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateWorkOrderDto): Promise<WorkOrder> => {
      const { data, error } = await apiClient.POST("/api/v1/work-orders", {
        body,
      });
      if (error) throw new Error("Failed to create work order");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    },
  });
}

// ── Convenience type re-exports ───────────────────────────────────────────────
export type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
};
