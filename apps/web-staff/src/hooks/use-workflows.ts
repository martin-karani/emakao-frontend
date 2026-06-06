import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface WorkflowRule {
  id: string;
  name: string;
  event_type: string;
  is_active: boolean;
  offset_hours: number;
  conditions: any;
  actions: any;
}

const API_BASE = "/api/proxy/api/agency/workflow-rules";

export function useWorkflows() {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json() as Promise<WorkflowRule[]>;
    },
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create workflow");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete workflow");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}
