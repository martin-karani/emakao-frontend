"use client";

import { useFormContext } from "react-hook-form";
import { Home, User, FileText, Banknote } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatKES } from "@emakao/shared";
import type { TenantFormValues } from "@/app/[agencySlug]/(dashboard)/properties/[propertySlug]/tenants/new/page";

const BILLING_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semi_annual: "Semi-Annual",
  annual: "Annual",
};

export function TenantSummaryAside() {
  const { watch } = useFormContext<TenantFormValues>();

  const unitNumber = watch("unitNumber");
  const residentName = watch("residentName");
  const residentEmail = watch("residentEmail");
  const rentAmount = Number(watch("rentAmount")) || 0;
  const depositAmount = Number(watch("depositAmount")) || 0;
  const billingFrequency = watch("billingFrequency");
  const startDate = watch("startDate");
  const recordDeposit = watch("recordDepositPayment");

  const hasUnit = !!unitNumber;
  const hasResident = !!residentName;
  const hasFinancials = rentAmount > 0;

  return (
    <div className="space-y-4">
      {/* Main dark card — mirrors SummaryAside */}
      <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-2xl">
        <CardHeader className="pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            New Tenant
          </p>
          <CardTitle className="text-xl">
            {residentName || "New Resident"}
          </CardTitle>
          {residentEmail && (
            <p className="text-xs text-white/50">{residentEmail}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Unit row */}
          <div className="flex items-center gap-2.5 text-sm text-white/60">
            <Home className="size-3.5 shrink-0" />
            <span>{hasUnit ? `Unit ${unitNumber}` : "No unit selected"}</span>
          </div>

          {/* Financials summary */}
          {hasFinancials && (
            <div className="rounded-xl bg-white/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Rent</span>
                <span className="text-sm font-semibold">
                  {formatKES(rentAmount)}
                </span>
              </div>
              {depositAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Deposit</span>
                  <span className="text-sm font-semibold">
                    {formatKES(depositAmount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Billing</span>
                <span className="text-xs font-medium">
                  {BILLING_LABELS[billingFrequency] ?? billingFrequency}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick stats panel — mirrors the property aside */}
      <div className="rounded-2xl border bg-background/50 p-4 backdrop-blur-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/50">
          Quick Stats
        </h4>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Home className="size-3.5" />
              Unit
            </span>
            <span className="font-medium">
              {hasUnit ? `Unit ${unitNumber}` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <User className="size-3.5" />
              Resident
            </span>
            <span className="font-medium">
              {hasResident ? residentName : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <FileText className="size-3.5" />
              Lease start
            </span>
            <span className="font-medium">{startDate || "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Banknote className="size-3.5" />
              Deposit paid
            </span>
            <span className="font-medium">
              {recordDeposit ? "On creation" : "Later"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
