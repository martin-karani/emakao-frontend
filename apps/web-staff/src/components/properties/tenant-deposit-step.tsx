"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Banknote, ArrowLeft, Loader2 } from "lucide-react";
import { StepHeader } from "./step-header";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatKES } from "@emakao/shared";
import type { TenantFormValues } from "@/app/[agencySlug]/(dashboard)/properties/[propertySlug]/tenants/new/page";

interface TenantDepositStepProps {
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

const PAYMENT_METHODS = [
  { value: "mpesa_paybill", label: "M-Pesa Paybill" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

export function TenantDepositStep({
  onBack,
  onSubmit,
  isPending,
}: TenantDepositStepProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<TenantFormValues>();

  const recordDeposit = watch("recordDepositPayment");
  const depositAmount = Number(watch("depositAmount")) || 0;
  const residentName = watch("residentName");
  const unitNumber = watch("unitNumber");

  return (
    <div className="space-y-6">
      <StepHeader
        icon={Banknote}
        title="Deposit Payment"
        description="Optionally record an upfront deposit payment for this tenant."
      />

      {/* Record deposit toggle */}
      <div className="grid gap-4 rounded-2xl border bg-background p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
          Deposit Recording
        </h3>

        <label
          className={cn(
            "flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors",
            recordDeposit
              ? "border-primary/30 bg-primary/5"
              : "hover:bg-muted/40"
          )}
        >
          <Controller
            control={control}
            name="recordDepositPayment"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            )}
          />
          <div className="space-y-1">
            <p className="font-medium text-sm">Record deposit payment now</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will create a{" "}
              <span className="font-semibold">
                {depositAmount > 0 ? formatKES(depositAmount) : "deposit"}
              </span>{" "}
              charge and a matching payment entry in the ledger immediately.
            </p>
          </div>
        </label>

        {recordDeposit && (
          <Field data-invalid={!!errors.depositPaymentMethod || undefined}>
            <Label>Payment Method</Label>
            <Controller
              control={control}
              name="depositPaymentMethod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select how the deposit was paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.depositPaymentMethod && (
              <FieldError>{errors.depositPaymentMethod.message}</FieldError>
            )}
          </Field>
        )}
      </div>

      {/* Confirmation summary */}
      <div className="rounded-2xl border bg-background p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
          Ready to Create
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Resident</span>
            <span className="font-medium">{residentName || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Unit</span>
            <span className="font-medium">{unitNumber ? `Unit ${unitNumber}` : "—"}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Deposit payment</span>
            <span className="font-medium">
              {recordDeposit ? "Will be recorded" : "Skipped"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          className="rounded-xl px-6"
          disabled={isPending}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={isPending}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating Lease...
            </>
          ) : (
            "Create Lease"
          )}
        </Button>
      </div>
    </div>
  );
}
