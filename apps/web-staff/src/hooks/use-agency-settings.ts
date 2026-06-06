import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AgencySettings {
  branding: {
    logo_url?: string;
    primary_color?: string;
    invoice_template?: string;
  };
  communication: {
    sms_provider?: string;
    email_provider?: string;
    whatsapp_provider?: string;
  };
  billing: {
    currency: string;
    tax_percentage: number;
    due_day: number;
    late_fee_type: "flat" | "percentage";
    late_fee_value: number;
    bank_details?: string;
  };
}

const API_BASE = "/api/proxy/api/agency/settings";

export function useAgencySettings() {
  return useQuery({
    queryKey: ["agency-settings"],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch agency settings");
      return res.json() as Promise<AgencySettings>;
    },
  });
}

export function useUpdateAgencySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<AgencySettings>) => {
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-settings"] });
    },
  });
}
