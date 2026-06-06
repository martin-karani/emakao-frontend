import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface NotificationTemplate {
  channel: "sms" | "email";
  event_key: string;
  property_id?: string;
  subject?: string;
  body: string;
}

const API_BASE = "/api/proxy/api/agency/notification-templates";

export function useNotificationTemplates(propertyId?: string) {
  return useQuery({
    queryKey: ["notification-templates", propertyId],
    queryFn: async () => {
      const url = propertyId ? `${API_BASE}?property_id=${propertyId}` : API_BASE;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notification templates");
      return res.json() as Promise<NotificationTemplate[]>;
    },
  });
}

export function useUpsertNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: NotificationTemplate) => {
      const { channel, event_key, property_id, ...body } = template;
      const url = new URL(`${window.location.origin}${API_BASE}/${channel}/${event_key}`);
      if (property_id) url.searchParams.set("property_id", property_id);
      
      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, property_id }),
      });
      if (!res.ok) throw new Error("Failed to update template");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates", variables.property_id] });
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}
