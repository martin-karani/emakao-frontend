// apps/web-staff/src/app/(dashboard)/properties/[id]/leases/page.tsx

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks";
import {
  ArrowRight,
  Loader2,
  Download,
  Plus,
  Home,
  CheckCircle2,
  FileText,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
import { usePropertyRoute } from "../property-route-context";
import { useTenants, type TenantWithLease } from "@/hooks/use-tenants";
import {
  useLedgerBalance,
  useLedgerEntries,
  usePostCharge,
  type LedgerEntryType,
} from "@/hooks/use-ledger";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@emakao/shared";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import html2pdf from "html2pdf.js";

export default function LeasesPage() {
  const { buildAgencyUrl } = useWorkspace([]);
  const { propertyId } = usePropertyRoute();
  const { data: tenants, isLoading: isLoadingTenants } = useTenants(propertyId);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithLease | null>(
    null,
  );
  const pdfRef = useRef<HTMLDivElement>(null);
  const postChargeMutation = usePostCharge();

  // State for posting charges/refunds
  const [isPostChargeOpen, setIsPostChargeOpen] = useState(false);
  const [postChargeType, setPostChargeType] = useState<
    "charge" | "deposit_refund"
  >("charge");
  const [postAmount, setPostAmount] = useState<string>("");
  const [postDescription, setPostDescription] = useState("");
  const [postEntryType, setPostEntryType] =
    useState<LedgerEntryType>("maintenance_charge");

  const { data: ledgerEntries, isLoading: isLoadingEntries } = useLedgerEntries(
    selectedTenant?.agreement_id,
  );
  const { data: balance, isLoading: isLoadingBalance } = useLedgerBalance(
    selectedTenant?.agreement_id,
  );

  const activeTenants = tenants?.filter((t) => t.status === "active") ?? [];
  const inactiveTenants = tenants?.filter((t) => t.status !== "active") ?? [];

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;
    const element = pdfRef.current;
    const opt: any = {
      margin: 1,
      filename: `lease-agreement-${selectedTenant?.unit_number}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePostCharge = () => {
    if (
      !selectedTenant?.agreement_id ||
      !postAmount ||
      parseFloat(postAmount) <= 0
    )
      return;

    postChargeMutation.mutate(
      {
        agreementId: selectedTenant.agreement_id,
        data: {
          entry_type:
            postChargeType === "charge" ? postEntryType : "deposit_refund",
          amount_kes: parseFloat(postAmount),
          description: postDescription || "",
        },
      },
      {
        onSuccess: () => {
          setIsPostChargeOpen(false);
          setPostAmount("");
          setPostDescription("");
        },
      },
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            render={<Link href={buildAgencyUrl("/leases")} />}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leases</h1>
            <p className="text-sm text-muted-foreground">
              Manage your current and past leases
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-base">Active Leases</CardTitle>
              <CardDescription>
                {activeTenants.length} active leases on this property
              </CardDescription>
            </div>
            <Button
              className="rounded-full"
              render={<Link href="./tenants/new" />}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingTenants ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeTenants.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No active leases on this property yet.
              </div>
            ) : (
              <div className="space-y-2">
                {activeTenants.map((tenant) => (
                  <div
                    key={tenant.agreement_id}
                    onClick={() => setSelectedTenant(tenant)}
                    className="group flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/30 -mx-3 px-3 py-2 rounded-md transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border bg-muted/50">
                        <Home className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-medium">{tenant.resident_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Unit {tenant.unit_number} • {tenant.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatKES(tenant.rent_amount_kes)}
                        </p>
                        <p className="text-xs text-muted-foreground">Rent</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {inactiveTenants.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inactive Leases</CardTitle>
              <CardDescription>
                {inactiveTenants.length} past leases on this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inactiveTenants.map((tenant) => (
                  <div
                    key={tenant.agreement_id}
                    onClick={() => setSelectedTenant(tenant)}
                    className="group flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/30 -mx-3 px-3 py-2 rounded-md transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border bg-muted/50">
                        <Home className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-medium">{tenant.resident_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Unit {tenant.unit_number} • {tenant.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatKES(tenant.rent_amount_kes)}
                        </p>
                        <p className="text-xs text-muted-foreground">Rent</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Agreement Detail Dialog */}
      <Dialog
        open={!!selectedTenant}
        onOpenChange={(open) => {
          if (!open) setSelectedTenant(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lease Agreement</DialogTitle>
            <DialogDescription>
              Full details for the selected lease agreement
            </DialogDescription>
          </DialogHeader>
          {!selectedTenant ? null : (
            <>
              {/* Lease Summary (PDF) */}
              <div ref={pdfRef} className="space-y-4 p-4 bg-white rounded-lg">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">LEASE AGREEMENT</h1>
                  <p className="text-sm text-muted-foreground">
                    Property: {propertyId}
                  </p>
                </div>
                <div>
                  <h4 className="text-md font-semibold text-muted-foreground">
                    Tenant Information
                  </h4>
                  <p className="text-lg font-medium">
                    {selectedTenant.resident_name}
                  </p>
                  {selectedTenant.resident_email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedTenant.resident_email}
                    </p>
                  )}
                  {selectedTenant.resident_phone && (
                    <p className="text-sm text-muted-foreground">
                      {selectedTenant.resident_phone}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <h4 className="text-md font-semibold text-muted-foreground">
                    Unit Information
                  </h4>
                  <p className="text-lg font-medium">
                    Unit {selectedTenant.unit_number}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Rent Amount
                    </p>
                    <p className="text-lg font-semibold">
                      {formatKES(selectedTenant.rent_amount_kes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Deposit Amount
                    </p>
                    <p className="text-lg font-semibold">
                      {formatKES(selectedTenant.deposit_kes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Outstanding Balance
                    </p>
                    <p className="text-lg font-semibold">
                      {formatKES(selectedTenant.outstanding_balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Deposit Paid
                    </p>
                    <p className="text-lg font-semibold">
                      {formatKES(selectedTenant.deposit_paid)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-md font-semibold text-muted-foreground">
                    Lease Status
                  </h4>
                  <Badge variant="secondary" className="mt-1">
                    {selectedTenant.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Balance Summary */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Current Balance
                </h3>
                {isLoadingBalance ? (
                  <Loader2 className="animate-spin" />
                ) : balance ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">
                        Total Charges
                      </p>
                      <p className="text-xl font-bold">
                        {formatKES(balance.total_charges_kes)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">
                        Total Payments
                      </p>
                      <p className="text-xl font-bold">
                        {formatKES(balance.total_payments_kes)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">
                        Outstanding
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          balance.outstanding_balance_kes > 0
                            ? "text-red-600"
                            : balance.outstanding_balance_kes < 0
                              ? "text-green-600"
                              : ""
                        }`}
                      >
                        {formatKES(balance.outstanding_balance_kes)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPostChargeType("charge");
                    setIsPostChargeOpen(true);
                  }}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Record Deduction
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPostChargeType("deposit_refund");
                    setIsPostChargeOpen(true);
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refund Deposit
                </Button>
              </div>

              {/* Ledger Entries */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Ledger Entries
                </h3>
                {isLoadingEntries ? (
                  <Loader2 className="animate-spin" />
                ) : ledgerEntries && ledgerEntries.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {ledgerEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex justify-between p-2 rounded-lg border"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {entry.entry_type.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.posted_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatKES(entry.amount_kes)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No ledger entries yet</p>
                )}
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Charge / Refund Dialog */}
      <Dialog
        open={isPostChargeOpen}
        onOpenChange={(open) => setIsPostChargeOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {postChargeType === "charge"
                ? "Record Deduction"
                : "Refund Deposit"}
            </DialogTitle>
            <DialogDescription>
              {postChargeType === "charge"
                ? "Record a deduction from the deposit"
                : "Record a deposit refund to the tenant"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {postChargeType === "charge" ? (
              <div className="space-y-2">
                <Label>Charge Type</Label>
                <Select
                  value={postEntryType}
                  onValueChange={(val) =>
                    setPostEntryType(val as LedgerEntryType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance_charge">
                      Maintenance Charge
                    </SelectItem>
                    <SelectItem value="late_fee">Late Fee</SelectItem>
                    <SelectItem value="legal_fee">Legal Fee</SelectItem>
                    <SelectItem value="penalty">Penalty</SelectItem>
                    <SelectItem value="utility">Utility Charge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Amount (KES)</Label>
              <Input
                type="number"
                value={postAmount}
                onChange={(e) => setPostAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                placeholder="Description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPostChargeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePostCharge}
              disabled={
                !postAmount ||
                parseFloat(postAmount) <= 0 ||
                postChargeMutation.isPending
              }
            >
              {postChargeMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" />
              ) : null}
              {postChargeType === "charge"
                ? "Record Deduction"
                : "Refund Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
