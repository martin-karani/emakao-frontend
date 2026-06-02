"use client";

import { useBankStatements } from "@/hooks/use-bank-statements";
import { formatKES } from "@emakao/shared";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDown, RefreshCcw, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FinanceDashboard() {
  const { data: statements, isLoading } = useBankStatements();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground animate-pulse">
        Loading ledgers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Financial Ledgers
          </h2>
          <p className="text-muted-foreground">
            Manage M-Pesa and Bank reconciliations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Sync M-Pesa
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statement Date</TableHead>
              <TableHead>Bank / Account</TableHead>
              <TableHead className="text-right">Opening</TableHead>
              <TableHead className="text-right">Closing</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statements?.map((statement) => {
              // unreconciled_lines_count is only populated on detail/reconciliation
              // responses, not on list items. Use optional chaining as a safe fallback.
              // For a full reconciliation view, use useReconciliationReport(statement.id).
              const unreconciledCount =
                (statement as { unreconciled_lines_count?: number })
                  .unreconciled_lines_count ?? null;
              const isReconciled = unreconciledCount === 0;

              return (
                <TableRow key={statement.id}>
                  <TableCell className="font-medium">
                    {new Date(statement.statement_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {statement.bank_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Acct: {statement.account_number}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatKES(statement.opening_balance)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatKES(statement.closing_balance)}
                  </TableCell>
                  <TableCell className="text-center">
                    {unreconciledCount === null ? (
                      <Badge variant="secondary">—</Badge>
                    ) : isReconciled ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Reconciled
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        {unreconciledCount} Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Lines
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {(!statements || statements.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No bank statements imported yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
