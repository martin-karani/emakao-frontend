import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@emakao/api-client";
import type { StaffUserResponse } from "@emakao/api-types";

// The backend returns StaffUserResponse which maps to our StaffUser
export type StaffUser = StaffUserResponse;

export function useStaff(
  params?: { limit?: number; offset?: number },
  options?: { enabled?: boolean }
) {
  const query = useQuery({
    queryKey: ["staff", params],
    queryFn: async (): Promise<StaffUser[]> => {
      const { data, error } = await apiClient.GET("/api/v1/staff", {
        params: {
          query: {
            limit: params?.limit ?? null,
            offset: params?.offset ?? null,
          },
        },
      });
      
      if (error) throw new Error("Failed to fetch staff");
      return data;
    },
    enabled: options?.enabled ?? true,
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    mutate: query.refetch,
  };
}

