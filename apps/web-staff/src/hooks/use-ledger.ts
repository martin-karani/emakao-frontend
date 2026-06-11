// apps/web-staff/src/hooks/use-ledger.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Base fetch helper ────────────────────────────────────────────────────────
async function proxyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ||
        `Request failed with status ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type LedgerEntryType =
  | "rent"
  | "deposit"
  | "hoa_dues"
  | "cam_charge"
  | "utility"
  | "maintenance_charge"
  | "late_fee"
  | "legal_fee"
  | "penalty"
  | "payment_mpesa"
  | "payment_bank"
  | "payment_cash"
  | "deposit_refund"
  | "credit_note"
  | "waiver"
  | "disbursement"
  | "journal_adjustment";

export interface LedgerEntry {
  id: string;
  agreement_id?: string;
  unit_id?: string;
  resident_id?: string;
  owner_id?: string;
  entry_type: LedgerEntryType;
  amount_kes: number;
  description: string;
  external_ref?: string;
  mpesa_receipt?: string;
  posted_by: string;
  posted_at: string;
  metadata: Record<string, unknown>;
}

export interface BalanceSummary {
  total_charges_kes: number;
  total_payments_kes: number;
  outstanding_balance_kes: number;
}

// ── Query Keys ────────────────────────────────────────────────────────────────

export const ledgerKeys = {
  entries: (agreementId: string) => ["ledger-entries", agreementId] as const,
  balance: (agreementId: string) => ["ledger-balance", agreementId] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useLedgerEntries(agreementId: string | undefined) {
  return useQuery({
    queryKey: ledgerKeys.entries(agreementId || ""),
    queryFn: () => {
      if (!agreementId) throw new Error("No agreement ID");
      return proxyFetch<LedgerEntry[]>(
        `/api/v1/agreements/${agreementId}/ledger`,
      );
    },
    enabled: !!agreementId,
  });
}

export function useLedgerBalance(agreementId: string | undefined) {
  return useQuery({
    queryKey: ledgerKeys.balance(agreementId || ""),
    queryFn: () => {
      if (!agreementId) throw new Error("No agreement ID");
      return proxyFetch<BalanceSummary>(
        `/api/v1/agreements/${agreementId}/balance`,
      );
    },
    enabled: !!agreementId,
  });
}

export function usePostCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      agreementId,
      data,
    }: {
      agreementId: string;
      data: {
        unit_id?: string;
        resident_id?: string;
        entry_type: LedgerEntryType;
        amount_kes: number;
        description: string;
        external_ref?: string;
        mpesa_receipt?: string;
        metadata?: Record<string, unknown>;
      };
    }) =>
      proxyFetch<LedgerEntry>(`/api/v1/agreements/${agreementId}/charges`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, { agreementId }) => {
      queryClient.invalidateQueries({
        queryKey: ledgerKeys.entries(agreementId),
      });
      queryClient.invalidateQueries({
        queryKey: ledgerKeys.balance(agreementId),
      });
    },
  });
}
