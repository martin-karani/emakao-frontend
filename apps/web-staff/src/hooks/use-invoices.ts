import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price_kes: number;
  total_kes: number;
  line_type?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  total_kes: number;
  status: string;
  due_date: string;
  created_at: string;
  line_items: InvoiceLineItem[];
}

const API_BASE = "/api/proxy/api/v1/invoices";

export function useInvoices(params: any = {}) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) searchParams.append(k, String(v));
      });
      const res = await fetch(`${API_BASE}?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json() as Promise<Invoice[]>;
    },
  });
}

export function useNotifyInvoice() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}/notify`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to send notification");
    },
  });
}

export function usePrintInvoice() {
  return {
    print: (id: string) => {
      window.open(`${API_BASE}/${id}/print`, "_blank");
    },
  };
}
