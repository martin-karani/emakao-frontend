import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PermissionDefinition {
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  is_system: boolean;
}

const API_BASE = "/api/proxy/api/agency/roles";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json() as Promise<Role[]>;
    },
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/permissions`);
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json() as Promise<PermissionDefinition[]>;
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; permissions: string[] }) => {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      permissions,
    }: {
      id: string;
      permissions: string[];
    }) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
