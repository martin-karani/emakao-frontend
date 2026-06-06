// apps/web-staff/src/components/unit-list.tsx
//
// Two-mode unit manager:
//  • InlineUnitList — creation wizard (useFieldArray, no API)
//  • LiveUnitList   — detail page (API-connected, Dialog CRUD)
//
// Uses Field/FieldError/Label from @/components/ui/field,
// NOT the missing @/components/ui/form.

"use client";

import { useState } from "react";
import { Controller, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Plus,
  Trash2,
  Loader2,
  LayoutGrid,
  Copy,
  ChevronDown,
  ChevronUp,
  Layers3,
} from "lucide-react";
import { formatKES } from "@emakao/shared";
import type { Unit, UnitStatus, UpdateUnitDto } from "@emakao/api-types";
import {
  useUnits,
  useCreateUnits,
  useUpdateUnit,
  useDeleteUnit,
} from "@/hooks/use-units";
import type { PropertyFormValues } from "@/lib/schemas/property";

// ── Unit field schema (also used by the dialog form) ─────────────────────────

export const unitFieldSchema = z.object({
  unit_number: z.string().min(1, "Unit number is required").max(50),
  floor: z.number().int().min(-10).max(200).nullable().optional(),
  size_sqm: z.number().min(0).nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  rent_amount_kes: z.number().min(0, "Rent must be ≥ 0"),
  deposit_kes: z.number().min(0).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
});

export type UnitFieldValues = z.infer<typeof unitFieldSchema>;

// ── Unit Type Dialog Form ───────────────────────────────────────────────────

const unitTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  base_rent: z.number().min(0),
  base_deposit: z.number().min(0),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

type UnitTypeFormValues = {
  name: string;
  bedrooms: number;
  bathrooms: number;
  base_rent: number;
  base_deposit: number;
  quantity: number;
};

interface UnitTypeDialogProps {
  onAdd: (data: UnitTypeFormValues) => void;
  trigger?: React.ReactElement;
}

export function UnitTypeDialog({ onAdd, trigger }: UnitTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitTypeFormValues>({
    resolver: zodResolver(unitTypeFormSchema),
    defaultValues: {
      name: "",
      bedrooms: 0,
      bathrooms: 0,
      base_rent: 0,
      base_deposit: 0,
      quantity: 1,
    },
  });

  const onSubmit = (data: UnitTypeFormValues) => {
    onAdd(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button variant="outline" size="sm" className="rounded-lg">
              <Plus className="mr-2 size-4" />
              Add Type
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Unit Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <Field className="col-span-2" data-invalid={!!errors.name}>
              <Label>Type Name *</Label>
              <Input
                placeholder="e.g. 1 Bedroom Deluxe"
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.quantity}>
              <Label>Quantity *</Label>
              <Input
                type="number"
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && (
                <FieldError>{errors.quantity.message}</FieldError>
              )}
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Bedrooms</Label>
              <Input
                type="number"
                {...register("bedrooms", { valueAsNumber: true })}
              />
            </Field>
            <Field>
              <Label>Bathrooms</Label>
              <Input
                type="number"
                {...register("bathrooms", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Base Rent (KES)</Label>
              <Input
                type="number"
                {...register("base_rent", { valueAsNumber: true })}
              />
            </Field>
            <Field>
              <Label>Base Deposit (KES)</Label>
              <Input
                type="number"
                {...register("base_deposit", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">
              Create Type
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<
  UnitStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  vacant: "secondary",
  occupied: "default",
  maintenance: "outline",
  reserved: "outline",
  inactive: "destructive",
};

// ─────────────────────────────────────────────────────────────────────────────
// INLINE MODE
// ─────────────────────────────────────────────────────────────────────────────

interface InlineUnitListProps {
  singleUnit?: boolean;
}

export function InlineUnitList({
  singleUnit = false,
}: InlineUnitListProps) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<PropertyFormValues>();

  const {
    fields: unitTypes,
    append: appendType,
    remove: removeType,
  } = useFieldArray({
    control,
    name: "unit_types",
  });

  const [expandedTypes, setExpandedTypes] = useState<Record<number, boolean>>(
    {},
  );

  const toggleType = (idx: number) => {
    setExpandedTypes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddUnitType = (data: UnitTypeFormValues) => {
    appendType({
      name: data.name,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      base_rent: data.base_rent,
      base_deposit: data.base_deposit,
      quantity: data.quantity,
    });
    toast.success(`Added ${data.quantity} units of type ${data.name}`);
  };

  const unitTypeErrors = errors.unit_types as
    | Array<Partial<Record<string, { message?: string }>> | undefined>
    | undefined;

  const totalUnits = unitTypes.reduce((sum, field, index) => {
    const qty = watch(`unit_types.${index}.quantity`) || 0;
    return sum + qty;
  }, 0);

  return (
    <div className="space-y-8">
      {/* ── UNIT TYPES SECTION ───────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">
              Property Units
            </h3>
            <p className="text-xs text-muted-foreground">
              Define your unit inventory by type and quantity.
              {totalUnits > 0 && (
                <span className="ml-2 font-bold text-primary">
                  {totalUnits} units total
                </span>
              )}
            </p>
          </div>
          <UnitTypeDialog onAdd={handleAddUnitType} />
        </div>

        {unitTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/5 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/5 text-primary">
              <Layers3 className="size-7" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-semibold">No units added yet</p>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Click &ldquo;Add Type&rdquo; to define the units available in
                this property.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {unitTypes.map((field, index) => {
              const isExpanded = expandedTypes[index];
              const typeErr = unitTypeErrors?.[index];
              const qty = watch(`unit_types.${index}.quantity`);
              const rent = watch(`unit_types.${index}.base_rent`);

              return (
                <div
                  key={field.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-card transition-all",
                    isExpanded
                      ? "ring-2 ring-primary/20 shadow-md"
                      : "hover:border-primary/30",
                  )}
                >
                  <div
                    className="flex cursor-pointer items-center justify-between p-5"
                    onClick={() => toggleType(index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <LayoutGrid className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold">
                            {watch(`unit_types.${index}.name`) || "New Type"}
                          </p>
                          <Badge
                            variant="secondary"
                            className="rounded-md font-bold"
                          >
                            {qty} {qty === 1 ? "Unit" : "Units"}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {watch(`unit_types.${index}.bedrooms`)} Bed
                          </span>
                          <span className="size-1 rounded-full bg-muted-foreground/30" />
                          <span className="flex items-center gap-1">
                            {watch(`unit_types.${index}.bathrooms`)} Bath
                          </span>
                          <span className="size-1 rounded-full bg-muted-foreground/30" />
                          <span className="font-medium text-primary">
                            {formatKES(rent || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeType(index);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="size-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-muted/5 p-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <Field
                          data-invalid={!!typeErr?.name}
                          className="md:col-span-2"
                        >
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Type Name
                          </Label>
                          <Input
                            placeholder="e.g. 1 Bedroom Deluxe"
                            className="bg-background"
                            {...register(`unit_types.${index}.name`)}
                          />
                        </Field>
                        <Field data-invalid={!!typeErr?.quantity}>
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            className="bg-background"
                            {...register(`unit_types.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Bedrooms
                            </Label>
                            <Input
                              type="number"
                              className="bg-background"
                              {...register(`unit_types.${index}.bedrooms`, {
                                valueAsNumber: true,
                              })}
                            />
                          </Field>
                          <Field>
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Bathrooms
                            </Label>
                            <Input
                              type="number"
                              className="bg-background"
                              {...register(`unit_types.${index}.bathrooms`, {
                                valueAsNumber: true,
                              })}
                            />
                          </Field>
                        </div>
                        <Field>
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Base Rent (KES)
                          </Label>
                          <Input
                            type="number"
                            className="bg-background"
                            {...register(`unit_types.${index}.base_rent`, {
                              valueAsNumber: true,
                            })}
                          />
                        </Field>
                        <Field>
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Base Deposit (KES)
                          </Label>
                          <Input
                            type="number"
                            className="bg-background"
                            {...register(`unit_types.${index}.base_deposit`, {
                              valueAsNumber: true,
                            })}
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE MODE
// ─────────────────────────────────────────────────────────────────────────────

interface LiveUnitListProps {
  propertyId: string;
  singleUnit?: boolean;
}

export function LiveUnitList({
  propertyId,
  singleUnit = false,
}: LiveUnitListProps) {
  const { data: units = [], isLoading } = useUnits(propertyId);
  const createMutation = useCreateUnits(propertyId);
  const updateMutation = useUpdateUnit(propertyId);
  const deleteMutation = useDeleteUnit(propertyId);

  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Delete unit ${unit.unit_number}? This cannot be undone.`))
      return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(unit.id);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete unit",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading units…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Units{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({units.length})
          </span>
        </h3>
        {!singleUnit && (
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
        )}
      </div>

      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      {units.length === 0 ? (
        <div className="border border-dashed rounded-md p-6 text-center text-muted-foreground text-sm">
          No units yet. Add the first unit to get started.
        </div>
      ) : (
        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit #</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Beds / Baths</TableHead>
                <TableHead className="text-right">Rent (KES)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">
                    {unit.unit_number}
                  </TableCell>
                  <TableCell>{unit.floor ?? "—"}</TableCell>
                  <TableCell>
                    {unit.bedrooms ?? "—"} bd / {unit.bathrooms ?? "—"} ba
                  </TableCell>
                  <TableCell className="text-right">
                    {formatKES(unit.rent_amount_kes)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[unit.status]}>
                      {unit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUnit(unit)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(unit)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add dialog */}
      <UnitDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title="Add Unit"
        defaultValues={{ unit_number: "", rent_amount_kes: 0, deposit_kes: 0 }}
        isPending={createMutation.isPending}
        error={createMutation.error?.message}
        onSubmit={(values) => {
          createMutation.mutate(
            { units: [values] },
            { onSuccess: () => setShowAddDialog(false) },
          );
        }}
      />

      {/* Edit dialog */}
      {editingUnit && (
        <UnitDialog
          open={!!editingUnit}
          onOpenChange={(open) => !open && setEditingUnit(null)}
          title={`Edit Unit ${editingUnit.unit_number}`}
          defaultValues={{
            unit_number: editingUnit.unit_number,
            floor: editingUnit.floor ?? undefined,
            size_sqm: editingUnit.size_sqm ?? undefined,
            bedrooms: editingUnit.bedrooms ?? undefined,
            bathrooms: editingUnit.bathrooms ?? undefined,
            rent_amount_kes: parseFloat(String(editingUnit.rent_amount_kes)),
            deposit_kes: parseFloat(String(editingUnit.deposit_kes)),
            description: editingUnit.description ?? undefined,
          }}
          isPending={updateMutation.isPending}
          error={updateMutation.error?.message}
          onSubmit={(values) => {
            const dto: UpdateUnitDto = {
              unit_number: values.unit_number,
              floor: values.floor ?? null,
              size_sqm: values.size_sqm ?? null,
              bedrooms: values.bedrooms ?? null,
              bathrooms: values.bathrooms ?? null,
              rent_amount_kes: values.rent_amount_kes,
              deposit_kes: values.deposit_kes ?? undefined,
              description: values.description ?? undefined,
            };
            updateMutation.mutate(
              { unitId: editingUnit.id, dto },
              { onSuccess: () => setEditingUnit(null) },
            );
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared unit dialog (add / edit)
// ─────────────────────────────────────────────────────────────────────────────

interface UnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues: Partial<UnitFieldValues>;
  isPending: boolean;
  error?: string;
  onSubmit: (values: UnitFieldValues) => void;
}

function UnitDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  isPending,
  error,
  onSubmit,
}: UnitDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitFieldValues>({
    resolver: zodResolver(unitFieldSchema),
    defaultValues: {
      unit_number: "",
      rent_amount_kes: 0,
      ...defaultValues,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!errors.unit_number || undefined}>
              <Label htmlFor="d-unit_number">Unit Number *</Label>
              <Input
                id="d-unit_number"
                placeholder="e.g. 101, A1"
                {...register("unit_number")}
              />
              {errors.unit_number && (
                <FieldError>{errors.unit_number.message}</FieldError>
              )}
            </Field>

            <Field>
              <Label htmlFor="d-floor">Floor</Label>
              <Controller
                control={control}
                name="floor"
                render={({ field: f }) => (
                  <Input
                    id="d-floor"
                    type="number"
                    placeholder="1"
                    value={f.value ?? ""}
                    onChange={(e) =>
                      f.onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                )}
              />
            </Field>

            <Field data-invalid={!!errors.rent_amount_kes || undefined}>
              <Label htmlFor="d-rent">Rent (KES) *</Label>
              <Input
                id="d-rent"
                type="number"
                min={0}
                placeholder="45000"
                {...register("rent_amount_kes", { valueAsNumber: true })}
              />
              {errors.rent_amount_kes && (
                <FieldError>{errors.rent_amount_kes.message}</FieldError>
              )}
            </Field>

            <Field>
              <Label htmlFor="d-deposit">Deposit (KES)</Label>
              <Input
                id="d-deposit"
                type="number"
                min={0}
                placeholder="45000"
                {...register("deposit_kes", { valueAsNumber: true })}
              />
            </Field>

            <Field>
              <Label htmlFor="d-bedrooms">Bedrooms</Label>
              <Controller
                control={control}
                name="bedrooms"
                render={({ field: f }) => (
                  <Input
                    id="d-bedrooms"
                    type="number"
                    min={0}
                    value={f.value ?? ""}
                    onChange={(e) =>
                      f.onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                )}
              />
            </Field>

            <Field>
              <Label htmlFor="d-bathrooms">Bathrooms</Label>
              <Controller
                control={control}
                name="bathrooms"
                render={({ field: f }) => (
                  <Input
                    id="d-bathrooms"
                    type="number"
                    min={0}
                    value={f.value ?? ""}
                    onChange={(e) =>
                      f.onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                )}
              />
            </Field>
          </div>

          <Field>
            <Label htmlFor="d-description">Description</Label>
            <Input
              id="d-description"
              placeholder="Optional notes about this unit"
              {...register("description")}
            />
          </Field>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
