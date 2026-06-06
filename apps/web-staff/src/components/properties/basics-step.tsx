import { useFormContext, Controller } from "react-hook-form";
import { Building2, ArrowRight } from "lucide-react";
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
import { PropertyConfigForm } from "./property-config-form";
import type { PropertyFormValues } from "@/lib/schemas/property";

interface BasicsStepProps {
  onNext: () => void;
}

export function BasicsStep({ onNext }: BasicsStepProps) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<PropertyFormValues>();

  const propertyType = watch("property_type");

  return (
    <div className="space-y-6">
      <StepHeader
        icon={Building2}
        title="Property Details"
        description="Set the baseline identity for this property."
      />

      <div className="grid gap-6 rounded-2xl border bg-background p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!errors.name || undefined}>
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              placeholder="e.g. BluNest Residences"
              {...register("name")}
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.property_type || undefined}>
            <Label>Type</Label>
            <Controller
              control={control}
              name="property_type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("config", {});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="multifamily">Multifamily</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="affordable_housing">
                      Affordable
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!errors.address || undefined}>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </Field>
          <Field data-invalid={!!errors.city || undefined}>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border bg-background p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
          Settings
        </h3>
        <PropertyConfigForm propertyType={propertyType} />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
        >
          Next: Units
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
