import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Integration {
  provider_type: string;
  provider_key: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  credentials: string; // Redacted "[redacted]"
}

export interface UpsertIntegrationInput {
  provider_type: string;
  provider_key: string;
  credentials: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

const API_BASE = "/api/proxy/api/agency/integrations";

export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch integrations");
      return res.json() as Promise<Integration[]>;
    },
  });
}

export function useUpsertIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertIntegrationInput) => {
      const { provider_type, provider_key, ...body } = input;
      const res = await fetch(`${API_BASE}/${provider_type}/${provider_key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update integration");
      return res.json().catch(() => ({})); // PUT might return 200 OK without body
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      provider_type,
      provider_key,
    }: {
      provider_type: string;
      provider_key: string;
    }) => {
      const res = await fetch(`${API_BASE}/${provider_type}/${provider_key}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete integration");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}
