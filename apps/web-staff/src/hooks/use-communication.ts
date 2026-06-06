import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface BroadcastRequest {
  subject: string;
  body: string;
  channels: "sms" | "email" | "both";
  property_id: string;
}

export function useBroadcast() {
  return useMutation({
    mutationFn: async (body: BroadcastRequest) => {
      const res = await fetch("/api/proxy/api/agency/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to send broadcast");
    },
  });
}

export function useBroadcastStatements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const res = await fetch("/api/proxy/api/agency/statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: propertyId }),
      });
      if (!res.ok) throw new Error("Failed to send statements");
    },
  });
}
