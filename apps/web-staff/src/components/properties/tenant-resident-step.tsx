"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { UserSearch, ArrowRight, ArrowLeft, UserPlus, Check } from "lucide-react";
import { StepHeader } from "./step-header";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchSelectDialog } from "@/components/shared/search-select-dialog";
import { PersonFormDialog } from "@/components/shared/person-form-dialog";
import type { TenantFormValues } from "@/app/[agencySlug]/(dashboard)/properties/[propertySlug]/tenants/new/page";

interface TenantResidentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function TenantResidentStep({ onNext, onBack }: TenantResidentStepProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TenantFormValues>();

  const residentId = watch("residentId");
  const residentName = watch("residentName");
  const residentEmail = watch("residentEmail");

  const initials = residentName
    ? residentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <div className="space-y-6">
      <StepHeader
        icon={UserSearch}
        title="Select Resident"
        description="Search for an existing resident or invite a new one."
      />

      <div className="grid gap-4 rounded-2xl border bg-background p-6">
        {/* Selected resident preview */}
        {residentId ? (
          <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{residentName}</p>
              {residentEmail && (
                <p className="text-xs text-muted-foreground">{residentEmail}</p>
              )}
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-4" />
            </div>
          </div>
        ) : (
          <Field data-invalid={!!errors.residentId || undefined}>
            <Label>Resident</Label>
            <Input
              readOnly
              value=""
              placeholder="No resident selected yet"
              className="cursor-default"
            />
            {errors.residentId && (
              <FieldError>{errors.residentId.message}</FieldError>
            )}
          </Field>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <SearchSelectDialog
            title="Search Residents"
            placeholder="Type a name, email or phone..."
            trigger={
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl">
                <UserSearch className="mr-2 size-4" />
                {residentId ? "Change Resident" : "Search Resident"}
              </Button>
            }
            searchFn={async (term) => {
              const res = await fetch(
                `/api/proxy/api/v1/residents?q=${encodeURIComponent(term)}`
              );
              if (!res.ok) return [];
              const data = await res.json();
              return (data as any[]).map((d) => ({
                id: d.id,
                title: d.full_name,
                subtitle: d.email || d.phone,
                data: d,
              }));
            }}
            onSelect={(res: any) => {
              if (res) {
                setValue("residentId", res.id, { shouldValidate: true });
                setValue("residentName", res.full_name);
                setValue("residentEmail", res.email ?? "");
              }
            }}
          />

          <PersonFormDialog
            title="Invite New Resident"
            trigger={
              <Button type="button" variant="secondary" className="flex-1 h-11 rounded-xl">
                <UserPlus className="mr-2 size-4" />
                Invite New Resident
              </Button>
            }
            onAdd={async (data) => {
              const res = await fetch("/api/proxy/api/v1/residents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              if (!res.ok) return;
              const newRes = await res.json();
              setValue("residentId", newRes.id, { shouldValidate: true });
              setValue("residentName", newRes.full_name);
              setValue("residentEmail", newRes.email ?? "");
            }}
          />
        </div>
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
          disabled={!residentId}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
        >
          Next: Lease
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
