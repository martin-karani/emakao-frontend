"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useUnits } from "@/hooks/use-units";
import { Controller } from "react-hook-form";
import { usePropertyRoute } from "@/app/[agencySlug]/(dashboard)/properties/[propertySlug]/property-route-context";
import type { TenantFormValues } from "@/app/[agencySlug]/(dashboard)/properties/[propertySlug]/tenants/new/page";
import type { UnitType } from "@/app/[agencySlug]/(dashboard)/properties/[propertySlug]/_shared/types";

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
  const { property } = usePropertyRoute();
  const { data: units } = useUnits(propertyId);
  const [selectedUnitTypeIds, setSelectedUnitTypeIds] = useState<string[]>([]);

  const vacantUnits = units?.filter((u) => u.status === "vacant") ?? [];

  // Filter units by selected unit types
  const filteredUnits =
    selectedUnitTypeIds.length > 0
      ? vacantUnits.filter(
          (u) => u.unit_type_id && selectedUnitTypeIds.includes(u.unit_type_id),
        )
      : vacantUnits;

  // Handle unit type selection
  const toggleUnitType = (unitTypeId: string) => {
    setSelectedUnitTypeIds((prev) =>
      prev.includes(unitTypeId)
        ? prev.filter((id) => id !== unitTypeId)
        : [...prev, unitTypeId],
    );
  };

  return (
    <div className="space-y-6">
      <StepHeader
        icon={Home}
        title="Select Unit"
        description="Choose a vacant unit to assign to this new tenant."
      />

      <div className="grid gap-6 rounded-2xl border bg-background p-6">
        {/* Unit Type Selection */}
        {property.unit_types && property.unit_types.length > 0 && (
          <Field>
            <Label>Filter by Unit Type</Label>
            <div className="grid gap-2">
              {property.unit_types.map((unitType) => (
                <div
                  key={unitType.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200"
                >
                  <Checkbox
                    id={`unit-type-${unitType.id}`}
                    checked={selectedUnitTypeIds.includes(unitType.id)}
                    onCheckedChange={() => toggleUnitType(unitType.id)}
                  />
                  <Label
                    htmlFor={`unit-type-${unitType.id}`}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{unitType.name}</span>
                      {unitType.unit_type && (
                        <span className="text-sm text-muted-foreground">
                          {unitType.unit_type} • {unitType.bedrooms} BR,{" "}
                          {unitType.bathrooms} BA
                        </span>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </Field>
        )}

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
                  {filteredUnits.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No vacant units available
                    </div>
                  ) : (
                    filteredUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">
                            Unit {u.unit_number}
                          </span>
                          {u.unit_type_id && (
                            <span className="text-xs text-muted-foreground">
                              {
                                property.unit_types?.find(
                                  (ut) => ut.id === u.unit_type_id,
                                )?.name
                              }
                            </span>
                          )}
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

        {filteredUnits.length === 0 && (
          <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            There are no vacant units on this property. Mark a unit as vacant
            first before adding a tenant.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={filteredUnits.length === 0}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
        >
          Next: Resident
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
