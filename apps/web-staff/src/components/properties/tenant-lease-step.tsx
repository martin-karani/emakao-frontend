"use client";

import { useFormContext, Controller } from "react-hook-form";
import { FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { StepHeader } from "./step-header";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { TenantFormValues } from "@/app/[agencySlug]/(dashboard)/properties/[propertySlug]/tenants/new/page";

interface TenantLeaseStepProps {
  onNext: () => void;
  onBack: () => void;
}

const BILLING_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

export function TenantLeaseStep({ onNext, onBack }: TenantLeaseStepProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<TenantFormValues>();

  return (
    <div className="space-y-6">
      <StepHeader
        icon={FileText}
        title="Lease Terms"
        description="Set the financial details and duration of this lease."
      />

      {/* Financial section */}
      <div className="grid gap-6 rounded-2xl border bg-background p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
          Financials
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.rentAmount || undefined}>
            <Label htmlFor="rentAmount">Monthly Rent (KES)</Label>
            <Input
              id="rentAmount"
              type="number"
              min={0}
              placeholder="e.g. 15000"
              {...register("rentAmount")}
            />
            {errors.rentAmount && (
              <FieldError>{errors.rentAmount.message as string}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.depositAmount || undefined}>
            <Label htmlFor="depositAmount">Deposit (KES)</Label>
            <Input
              id="depositAmount"
              type="number"
              min={0}
              placeholder="e.g. 30000"
              {...register("depositAmount")}
            />
            {errors.depositAmount && (
              <FieldError>{errors.depositAmount.message as string}</FieldError>
            )}
          </Field>
        </div>

        <Field data-invalid={!!errors.billingFrequency || undefined}>
          <Label>Billing Frequency</Label>
          <Controller
            control={control}
            name="billingFrequency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.billingFrequency && (
            <FieldError>{errors.billingFrequency.message}</FieldError>
          )}
        </Field>
      </div>

      {/* Duration section */}
      <div className="grid gap-6 rounded-2xl border bg-background p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
          Duration
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.startDate || undefined}>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
            />
            {errors.startDate && (
              <FieldError>{errors.startDate.message}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.endDate || undefined}>
            <Label htmlFor="endDate">
              End Date{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
            />
            {errors.endDate && (
              <FieldError>{errors.endDate.message}</FieldError>
            )}
          </Field>
        </div>
        <p className="text-xs text-muted-foreground">
          Leave end date empty for open-ended leases.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          className="rounded-xl px-6"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
        >
          Next: Deposit
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
