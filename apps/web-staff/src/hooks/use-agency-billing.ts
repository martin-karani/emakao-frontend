import { useQuery } from "@tanstack/react-query";

export interface PropertyBillingSummary {
  property_id: string;
  property_name: string;
  currency_code: string;
  rent_due_day: number;
  late_fee_summary: string;
  utility_summary: string;
}

const API_BASE = "/api/proxy/api/agency/billing-summary";

export function useAgencyBillingSummary() {
  return useQuery({
    queryKey: ["agency-billing-summary"],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch billing summary");
      return res.json() as Promise<PropertyBillingSummary[]>;
    },
  });
}
