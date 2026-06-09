import { useMutation, useQueryClient } from "@tanstack/react-query";


export interface AddTenantInput {
  propertyId: string;
  unitId: string;
  residentId: string;
  startDate: string;
  endDate?: string;
  rentAmountKes: number;
  depositKes: number;
  billingFrequency: string;
  recordDepositPayment: boolean;
  depositPaymentMethod?: string;
}

export function useAddTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddTenantInput) => {
      const res = await fetch("/api/proxy/api/v1/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: input.propertyId,
          unit_id: input.unitId,
          resident_id: input.residentId,
          start_date: input.startDate,
          end_date: input.endDate,
          rent_amount_kes: input.rentAmountKes,
          deposit_kes: input.depositKes,
          billing_frequency: input.billingFrequency,
          record_deposit_payment: input.recordDepositPayment,
          deposit_payment_method: input.depositPaymentMethod,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to add tenant");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["properties", variables.propertyId, "tenants"],
      });
      queryClient.invalidateQueries({
        queryKey: ["units", variables.propertyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["agreements"],
      });
      queryClient.invalidateQueries({
        queryKey: ["properties", variables.propertyId, "summary"],
      });
    },
  });
}
