// apps/web-staff/src/components/property-config-form.tsx
//
// Renders the type-specific config fields for the selected property type.
// Uses react-hook-form's register() + Controller for the Select inputs.
// NO dependency on @/components/ui/form (which doesn't exist in this project).

"use client";

import { Controller, useFormContext } from "react-hook-form";
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
import type { PropertyFormValues } from "@/lib/schemas/property";

interface Props {
  propertyType: string;
}

export function PropertyConfigForm({ propertyType }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PropertyFormValues>();

  const cfg = errors.config as Record<string, { message?: string }> | undefined;

  switch (propertyType) {
    // ── Single Family ──────────────────────────────────────────────────────
    case "residential":
      return (
        <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 text-center">
          <p className="text-sm font-medium text-primary">Single Family Home</p>
          <p className="text-xs text-muted-foreground mt-1">
            Configure the unit details in the next step using Unit Types.
          </p>
        </div>
      );

    // ── Multifamily ────────────────────────────────────────────────────────
    case "multifamily":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!cfg?.floors || undefined}>
            <Label htmlFor="config.floors">Number of Floors</Label>
            <Input
              id="config.floors"
              type="number"
              min={1}
              placeholder="5"
              {...register("config.floors", { valueAsNumber: true })}
            />
            {cfg?.floors && <FieldError>{cfg.floors.message}</FieldError>}
          </Field>
          <Field data-invalid={!!cfg?.parking_spaces || undefined}>
            <Label htmlFor="config.parking_spaces">Parking Spaces</Label>
            <Input
              id="config.parking_spaces"
              type="number"
              min={0}
              placeholder="20"
              {...register("config.parking_spaces", { valueAsNumber: true })}
            />
            {cfg?.parking_spaces && (
              <FieldError>{cfg.parking_spaces.message}</FieldError>
            )}
          </Field>
        </div>
      );

    // ── Commercial ─────────────────────────────────────────────────────────
    case "commercial":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!cfg?.cam_rate || undefined}>
            <Label htmlFor="config.cam_rate">CAM Rate (KES)</Label>
            <Input
              id="config.cam_rate"
              type="number"
              min={0}
              placeholder="150"
              {...register("config.cam_rate", { valueAsNumber: true })}
            />
            {cfg?.cam_rate && <FieldError>{cfg.cam_rate.message}</FieldError>}
          </Field>
          <Field data-invalid={!!cfg?.building_class || undefined}>
            <Label htmlFor="config.building_class">Building Class</Label>
            <Controller
              control={control}
              name="config.building_class"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Class A</SelectItem>
                    <SelectItem value="B">Class B</SelectItem>
                    <SelectItem value="C">Class C</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {cfg?.building_class && (
              <FieldError>{cfg.building_class.message}</FieldError>
            )}
          </Field>
        </div>
      );

    // ── Community Association ──────────────────────────────────────────────
    case "community":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!cfg?.due_billing_cycle || undefined}>
            <Label htmlFor="config.due_billing_cycle">Billing Cycle</Label>
            <Controller
              control={control}
              name="config.due_billing_cycle"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="SemiAnnual">Semi-Annual</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {cfg?.due_billing_cycle && (
              <FieldError>{cfg.due_billing_cycle.message}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!cfg?.board_seats || undefined}>
            <Label htmlFor="config.board_seats">Board Seats</Label>
            <Input
              id="config.board_seats"
              type="number"
              min={1}
              placeholder="3"
              {...register("config.board_seats", { valueAsNumber: true })}
            />
            {cfg?.board_seats && (
              <FieldError>{cfg.board_seats.message}</FieldError>
            )}
          </Field>
        </div>
      );

    case "student":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!cfg?.campus_proximity_km || undefined}>
            <Label htmlFor="config.campus_proximity_km">
              Campus Proximity (KM)
            </Label>
            <Input
              id="config.campus_proximity_km"
              type="number"
              step="0.1"
              min={0}
              placeholder="1.5"
              {...register("config.campus_proximity_km", {
                valueAsNumber: true,
              })}
            />
            {cfg?.campus_proximity_km && (
              <FieldError>{cfg.campus_proximity_km.message}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!cfg?.semester_start_month || undefined}>
            <Label htmlFor="config.semester_start_month">Semester Start</Label>
            <Input
              id="config.semester_start_month"
              type="number"
              min={1}
              max={12}
              placeholder="9"
              {...register("config.semester_start_month", {
                valueAsNumber: true,
              })}
            />
            {cfg?.semester_start_month && (
              <FieldError>{cfg.semester_start_month.message}</FieldError>
            )}
          </Field>
        </div>
      );

    case "affordable_housing":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!cfg?.program_id || undefined}>
            <Label htmlFor="config.program_id">Program ID</Label>
            <Input
              id="config.program_id"
              placeholder="HUD-VASH"
              {...register("config.program_id")}
            />
            {cfg?.program_id && (
              <FieldError>{cfg.program_id.message}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!cfg?.ami_percentage || undefined}>
            <Label htmlFor="config.ami_percentage">AMI %</Label>
            <Input
              id="config.ami_percentage"
              type="number"
              min={0}
              max={100}
              placeholder="60"
              {...register("config.ami_percentage", { valueAsNumber: true })}
            />
            {cfg?.ami_percentage && (
              <FieldError>{cfg.ami_percentage.message}</FieldError>
            )}
          </Field>
        </div>
      );

    default:
      return null;
  }
}
