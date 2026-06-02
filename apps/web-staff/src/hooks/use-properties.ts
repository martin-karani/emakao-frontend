import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@emakao/api-client";
import type { Property, PropertyType } from "@emakao/api-types";

interface UsePropertiesOptions {
  property_type?: PropertyType;
  limit?: number;
  offset?: number;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  return useQuery({
    queryKey: ["properties", options],
    queryFn: async (): Promise<Property[]> => {
      const { data, error } = await apiClient.GET("/api/v1/properties", {
        params: {
          query: {
            property_type: options.property_type ?? null,
            limit: options.limit ?? null,
            offset: options.offset ?? null,
          },
        },
      });
      if (error) throw new Error("Failed to fetch properties");
      return data;
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: async (): Promise<Property> => {
      const { data, error } = await apiClient.GET("/api/v1/properties/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to fetch property");
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/api/v1/properties/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to delete property");
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["properties"] });
      // Snapshot all property query variants for rollback
      const snapshot = queryClient.getQueriesData<Property[]>({
        queryKey: ["properties"],
      });

      queryClient.setQueriesData<Property[]>(
        { queryKey: ["properties"] },
        (old) => old?.filter((p) => p.id !== deletedId)
      );
      return { snapshot };
    },
    onError: (_err, _id, context) => {
      // Roll back all property query variants
      context?.snapshot.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
