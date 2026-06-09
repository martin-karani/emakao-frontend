"use client";

import { useFormContext } from "react-hook-form";
import { Home, ArrowRight } from "lucide-react";
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
import { useUnits } from "@/hooks/use-units";
import { Controller } from "react-hook-form";
import type { TenantFormValues } from "@/app/[agencySlug]/(dashboard)/properties/[propertySlug]/tenants/new/page";

interface TenantUnitStepProps {
  propertyId: string;
  onNext: () => void;
}

export function TenantUnitStep({ propertyId, onNext }: TenantUnitStepProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TenantFormValues>();

  const { data: units } = useUnits(propertyId);
  const vacantUnits = units?.filter((u) => u.status === "vacant") ?? [];

  return (
    <div className="space-y-6">
      <StepHeader
        icon={Home}
        title="Select Unit"
        description="Choose a vacant unit to assign to this new tenant."
      />

      <div className="grid gap-6 rounded-2xl border bg-background p-6">
        <Field data-invalid={!!errors.unitId || undefined}>
          <Label>Available Units</Label>
          <Controller
            control={control}
            name="unitId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  const unit = vacantUnits.find((u) => u.id === val);
                  if (unit) setValue("unitNumber", unit.unit_number);
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a vacant unit" />
                </SelectTrigger>
                <SelectContent>
                  {vacantUnits.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No vacant units available
                    </div>
                  ) : (
                    vacantUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">
                            Unit {u.unit_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.unitId && <FieldError>{errors.unitId.message}</FieldError>}
        </Field>

        {vacantUnits.length === 0 && (
          <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            There are no vacant units on this property. Mark a unit as vacant first before adding a tenant.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={vacantUnits.length === 0}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
        >
          Next: Resident
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
