import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Caretaker {
  id: string;
  property_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

export interface CreateCaretakerDto {
  property_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

export interface UpdateCaretakerDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

const API_BASE = "/api/proxy/api/v1/caretakers";

export function useCaretakers(propertyId?: string) {
  return useQuery({
    queryKey: ["caretakers", propertyId],
    queryFn: async (): Promise<Caretaker[]> => {
      const url = propertyId
        ? `${API_BASE}?property_id=${propertyId}`
        : API_BASE;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch caretakers");
      return res.json();
    },
  });
}

export function useCreateCaretaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCaretakerDto): Promise<Caretaker> => {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create caretaker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caretakers"] });
    },
  });
}

export function useUpdateCaretaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: UpdateCaretakerDto;
    }): Promise<Caretaker> => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update caretaker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caretakers"] });
    },
  });
}
