/**
 * @file use-bank-statements.ts
 *
 * Replaces the old `use-finance.ts`.  The backend resource is `bank-statements`
 * (not `finance/statements`).  Unreconciled lines are exposed via the
 * reconciliation report endpoint, not a query param on a lines endpoint.
 *
 * Key schema facts:
 *   - List:    GET /api/v1/bank-statements            → BankStatementResponse[]
 *              (lines array is EMPTY in list responses — by design)
 *   - Detail:  GET /api/v1/bank-statements/{id}       → BankStatementResponse
 *              (lines array is POPULATED here)
 *   - Recon:   GET /api/v1/bank-statements/{id}/reconciliation
 *              → ReconciliationReportResponse
 *              (includes unmatched_lines[], matched/unmatched counts & totals)
 *   - Match:   POST /api/v1/bank-statements/{id}/lines/{line_id}/match
 *   - Unmatch: POST /api/v1/bank-statements/{id}/lines/{line_id}/unmatch
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@emakao/api-client";
import type {
  BankStatement,
  BankStatementSummary,
  BankStatementLine,
  ReconciliationReport,
} from "@emakao/api-types";

// ── List ──────────────────────────────────────────────────────────────────────

export function useBankStatements(
  options: {
    limit?: number;
    offset?: number;
  } = {}
) {
  return useQuery({
    queryKey: ["bank-statements", options],
    queryFn: async (): Promise<BankStatementSummary[]> => {
      const { data, error } = await apiClient.GET("/api/v1/bank-statements", {
        params: {
          query: {
            limit: options.limit,
            offset: options.offset,
          },
        },
      });
      if (error) throw new Error("Failed to fetch bank statements");
      return data;
    },
  });
}

// ── Detail (with lines) ───────────────────────────────────────────────────────

/**
 * Fetches the full statement including its transaction lines array.
 * The list endpoint intentionally omits lines for performance — always use
 * this hook when you need to render individual line items.
 */
export function useBankStatement(id: string) {
  return useQuery({
    queryKey: ["bank-statements", id],
    queryFn: async (): Promise<BankStatement> => {
      const { data, error } = await apiClient.GET(
        "/api/v1/bank-statements/{id}",
        { params: { path: { id } } }
      );
      if (error) throw new Error("Failed to fetch bank statement");
      return data as BankStatement;
    },
    enabled: !!id,
  });
}

// ── Reconciliation report ─────────────────────────────────────────────────────

/**
 * Returns the reconciliation report for a statement.
 * `report.unmatched_lines` is the primary work list for the bookkeeper.
 * `report.unmatched_count` / `report.matched_count` drive the progress UI.
 */
export function useReconciliationReport(statementId: string) {
  return useQuery({
    queryKey: ["bank-statements", statementId, "reconciliation"],
    queryFn: async (): Promise<ReconciliationReport> => {
      const { data, error } = await apiClient.GET(
        "/api/v1/bank-statements/{id}/reconciliation",
        { params: { path: { id: statementId } } }
      );
      if (error) throw new Error("Failed to fetch reconciliation report");
      return data as ReconciliationReport;
    },
    enabled: !!statementId,
  });
}

// ── Match / Unmatch ───────────────────────────────────────────────────────────

export function useMatchLine(statementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lineId,
      journalEntryId,
    }: {
      lineId: string;
      journalEntryId: string;
    }) => {
      const { error } = await apiClient.POST(
        "/api/v1/bank-statements/{id}/lines/{line_id}/match",
        {
          params: { path: { id: statementId, line_id: lineId } },
          body: { journal_entry_id: journalEntryId },
        }
      );
      if (error) throw new Error("Failed to match line");
    },
    onSuccess: () => {
      // Reconciliation counts changed — refetch report and detail
      queryClient.invalidateQueries({
        queryKey: ["bank-statements", statementId, "reconciliation"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bank-statements", statementId],
      });
    },
  });
}

export function useUnmatchLine(statementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lineId: string) => {
      const { error } = await apiClient.POST(
        "/api/v1/bank-statements/{id}/lines/{line_id}/unmatch",
        { params: { path: { id: statementId, line_id: lineId } } }
      );
      if (error) throw new Error("Failed to unmatch line");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bank-statements", statementId, "reconciliation"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bank-statements", statementId],
      });
    },
  });
}

// ── Convenience type re-exports ───────────────────────────────────────────────
export type { BankStatement, BankStatementLine, ReconciliationReport };
