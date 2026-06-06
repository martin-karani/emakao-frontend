"use client";

import { useState } from "react";
import {
  useInvoices,
  useNotifyInvoice,
  usePrintInvoice,
} from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Send,
  Printer,
  Loader2,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const { data: invoices, isLoading } = useInvoices();
  const notifyMutation = useNotifyInvoice();
  const { print } = usePrintInvoice();

  const handleNotify = async (id: string) => {
    try {
      await notifyMutation.mutateAsync(id);
      toast.success("Notification sent to resident");
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Billing & Invoices
          </h1>
          <p className="text-muted-foreground">
            Manage rent and utility invoices. Notify residents and print copies.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices?.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell>
                  {new Date(invoice.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>KES {invoice.total_kes.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={invoice.status === "paid" ? "default" : "outline"}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Send Notification"
                      onClick={() => handleNotify(invoice.id)}
                      disabled={notifyMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Print Invoice"
                      onClick={() => print(invoice.id)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
