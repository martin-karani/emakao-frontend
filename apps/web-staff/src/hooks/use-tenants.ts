import { useQuery } from "@tanstack/react-query";


export interface TenantWithLease {
  resident_id: string;
  resident_name: string;
  resident_email?: string;
  resident_phone?: string;
  unit_id: string;
  unit_number: string;
  agreement_id: string;
  rent_amount_kes: number;
  deposit_kes: number;
  status: string;
  outstanding_balance: number;
  deposit_paid: number;
}

export function useTenants(propertyId?: string) {
  return useQuery({
    queryKey: ["properties", propertyId, "tenants"],
    queryFn: async (): Promise<TenantWithLease[]> => {
      if (!propertyId) throw new Error("Property ID is required");
      const res = await fetch(`/api/proxy/api/v1/properties/${propertyId}/tenants`);
      if (!res.ok) {
        throw new Error("Failed to fetch tenants");
      }
      return res.json();
    },
    enabled: !!propertyId,
  });
}
