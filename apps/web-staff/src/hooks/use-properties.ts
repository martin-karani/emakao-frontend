import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@emakao/api-client";
import type {
  Property,
  PropertySummary,
  PropertyType,
  CreatePropertyDto,
  UpdatePropertyDto,
} from "@emakao/api-types";

interface UsePropertiesOptions {
  property_type?: PropertyType;
  limit?: number;
  offset?: number;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  return useQuery({
    queryKey: ["properties", options],
    queryFn: async (): Promise<PropertySummary[]> => {
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

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: async (): Promise<Property> => {
      const { data, error } = await apiClient.GET("/api/v1/properties/{id}", {
        params: { path: { id: id! } },
      });
      if (error) throw new Error("Failed to fetch property");
      return data;
    },
    enabled: !!id,
  });
}

export function usePropertySummary(id: string | undefined) {
  return useQuery({
    queryKey: ["properties", id, "summary"],
    queryFn: async (): Promise<PropertySummary> => {
      const res = await fetch(`/api/proxy/api/v1/properties/${id}/summary`);
      if (!res.ok) {
        throw new Error("Failed to fetch property summary");
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function usePropertyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["properties", "slug", slug],
    queryFn: async (): Promise<Property> => {
      const res = await fetch(
        `/api/proxy/api/v1/properties/by-slug/${encodeURIComponent(slug!)}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch property");
      }
      return res.json();
    },
    enabled: !!slug,
  });
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePropertyDto): Promise<Property> => {
      const { data, error } = await apiClient.POST("/api/v1/properties", {
        body: dto,
      });
      if (error) {
        // Surface the backend validation message when available
        const msg =
          (error as { message?: string }).message ??
          "Failed to create property";
        throw new Error(msg);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdatePropertyDto;
    }): Promise<Property> => {
      const { data, error } = await apiClient.PUT("/api/v1/properties/{id}", {
        params: { path: { id } },
        body: dto,
      });
      if (error) throw new Error("Failed to update property");
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["properties", updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

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
      const snapshot = queryClient.getQueriesData<PropertySummary[]>({
        queryKey: ["properties"],
      });

      queryClient.setQueriesData<PropertySummary[]>(
        { queryKey: ["properties"] },
        (old) => old?.filter((p) => p.id !== deletedId),
      );
      return { snapshot };
    },
    onError: (_err, _id, context) => {
      context?.snapshot.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
