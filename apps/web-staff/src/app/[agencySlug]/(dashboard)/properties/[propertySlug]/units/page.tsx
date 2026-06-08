// apps/web-staff/src/app/(dashboard)/properties/[id]/units/page.tsx
//
// Units tab — full unit management view for a single property.

"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Home,
  Layers,
  Pencil,
  DoorOpen,
  Ruler,
  BedDouble,
  Bath,
} from "lucide-react";

import { useUnits, useUpdateUnit, useDeleteUnit } from "@/hooks/use-units";
import { Badge } from "@/components/ui/badge";
import { usePropertyRoute } from "../property-route-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Unit, UnitStatus, UpdateUnitDto } from "@emakao/api-types";
import { formatKES } from "@emakao/shared";
import { UnitType, UNIT_STATUS_CONFIG, UNIT_STATUSES } from "../_shared/types";

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UnitStatus }) {
  const cfg = UNIT_STATUS_CONFIG[status] ?? UNIT_STATUS_CONFIG.inactive;
  return (
    <Badge variant={cfg.variant} className="gap-1.5 text-xs">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </Badge>
  );
}

function OccupancyBar({ units }: { units: Unit[] }) {
  const total = units.length;
  const occupied = units.filter((u) => u.status === "occupied").length;
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {occupied}/{total} occupied
        </span>
        <span className="font-medium text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function UnitEditSheet({
  unit,
  propertyId,
  open,
  onOpenChange,
}: {
  unit: Unit;
  propertyId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const updateMutation = useUpdateUnit(propertyId);
  const [form, setForm] = React.useState({
    unit_number: unit.unit_number,
    floor: unit.floor?.toString() ?? "",
    size_sqm: unit.size_sqm?.toString() ?? "",
    bedrooms: unit.bedrooms?.toString() ?? "",
    bathrooms: unit.bathrooms?.toString() ?? "",
    rent_amount_kes: unit.rent_amount_kes,
    deposit_kes: unit.deposit_kes,
    status: unit.status,
    description: unit.description ?? "",
  });

  React.useEffect(() => {
    setForm({
      unit_number: unit.unit_number,
      floor: unit.floor?.toString() ?? "",
      size_sqm: unit.size_sqm?.toString() ?? "",
      bedrooms: unit.bedrooms?.toString() ?? "",
      bathrooms: unit.bathrooms?.toString() ?? "",
      rent_amount_kes: unit.rent_amount_kes,
      deposit_kes: unit.deposit_kes,
      status: unit.status,
      description: unit.description ?? "",
    });
  }, [unit]);

  const field = (name: keyof typeof form) => ({
    value: form[name] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [name]: e.target.value })),
  });

  const handleSave = async () => {
    const dto: UpdateUnitDto = {
      unit_number: form.unit_number.trim() || undefined,
      floor: form.floor !== "" ? Number(form.floor) : null,
      size_sqm: form.size_sqm !== "" ? Number(form.size_sqm) : null,
      bedrooms: form.bedrooms !== "" ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms !== "" ? Number(form.bathrooms) : null,
      rent_amount_kes: form.rent_amount_kes.trim() || undefined,
      deposit_kes: form.deposit_kes.trim() || undefined,
      status: form.status,
      description: form.description.trim() || null,
    };
    await updateMutation.mutateAsync({ unitId: unit.id, dto });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Unit {unit.unit_number}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="unit_number">Unit Number</Label>
            <Input id="unit_number" {...field("unit_number")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, status: val as UnitStatus }))
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rent">Rent (KES)</Label>
              <Input
                id="rent"
                type="number"
                min={0}
                {...field("rent_amount_kes")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deposit">Deposit (KES)</Label>
              <Input
                id="deposit"
                type="number"
                min={0}
                {...field("deposit_kes")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                min={0}
                placeholder="e.g. 2"
                {...field("floor")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="size_sqm">Size (m²)</Label>
              <Input
                id="size_sqm"
                type="number"
                min={0}
                placeholder="e.g. 75"
                {...field("size_sqm")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min={0}
                {...field("bedrooms")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min={0}
                {...field("bathrooms")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Optional notes…"
              {...field("description")}
            />
          </div>
        </div>
        <SheetFooter className="gap-2">
          <SheetClose>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </SheetClose>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function UnitCard({
  unit,
  propertyId,
  onDelete,
  isDeleting,
}: {
  unit: Unit;
  propertyId: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [editOpen, setEditOpen] = React.useState(false);
  return (
    <>
      <div className="group flex items-start justify-between rounded-lg border bg-card px-4 py-3 hover:shadow-sm transition-shadow gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            <span className="font-semibold text-sm truncate">
              Unit {unit.unit_number}
            </span>
            {unit.floor != null && (
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                Floor {unit.floor}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatKES(Number(unit.rent_amount_kes))}
              <span className="text-muted-foreground font-normal">/mo</span>
            </span>
            {unit.size_sqm && (
              <span className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                {unit.size_sqm} m²
              </span>
            )}
            {unit.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3 h-3" />
                {unit.bedrooms}
              </span>
            )}
            {unit.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {unit.bathrooms}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={unit.status} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditOpen(true)}
              title="Edit unit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <button
              className="text-xs text-destructive hover:underline px-1 disabled:opacity-50"
              disabled={isDeleting}
              onClick={() => {
                if (
                  confirm(
                    `Delete Unit ${unit.unit_number}? This cannot be undone.`,
                  )
                ) {
                  onDelete(unit.id);
                }
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <UnitEditSheet
        unit={unit}
        propertyId={propertyId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

function groupByUnitType(
  units: Unit[],
  unitTypes: UnitType[],
): { unitType: UnitType | null; units: Unit[] }[] {
  const groups = new Map<string | null, Unit[]>();
  for (const u of units) {
    const key = u.unit_type_id ?? null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(u);
  }
  const result: { unitType: UnitType | null; units: Unit[] }[] = [];
  for (const ut of unitTypes) {
    result.push({ unitType: ut, units: groups.get(ut.id) ?? [] });
    groups.delete(ut.id);
  }
  const leftover: Unit[] = [];
  for (const [, us] of groups) leftover.push(...us);
  if (leftover.length) result.push({ unitType: null, units: leftover });
  return result;
}

function UnitTypeSection({
  unitType,
  units,
  propertyId,
}: {
  unitType: UnitType | null;
  units: Unit[];
  propertyId: string;
}) {
  const deleteMutation = useDeleteUnit(propertyId);
  const label = unitType?.name ?? "Uncategorised";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">{label}</h3>
          {unitType?.bedrooms != null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BedDouble className="w-3 h-3" />
              {unitType.bedrooms}
              <Bath className="w-3 h-3 ml-1" />
              {unitType.bathrooms}
            </span>
          )}
          <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {units.length} unit{units.length !== 1 ? "s" : ""}
          </span>
        </div>
        {unitType?.base_rent && (
          <span className="text-xs text-muted-foreground">
            from{" "}
            <span className="text-foreground font-medium">
              {formatKES(Number(unitType.base_rent))}
            </span>
          </span>
        )}
      </div>
      <OccupancyBar units={units} />
      <div className="space-y-2">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            propertyId={propertyId}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UnitsPage() {
  const { propertyId, property } = usePropertyRoute();
  const { data: units, isLoading } = useUnits(propertyId);
  const unitTypes = (property?.unit_types ?? []) as UnitType[];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading units…
      </div>
    );
  }

  const grouped = groupByUnitType(units ?? [], unitTypes);

  return (
    <div className="space-y-6">
      {/* Stat bar */}
      {(units?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={units!.length}
            color="text-foreground"
          />
          <StatCard
            label="Occupied"
            value={units!.filter((u) => u.status === "occupied").length}
            color="text-emerald-600"
          />
          <StatCard
            label="Vacant"
            value={units!.filter((u) => u.status === "vacant").length}
            color="text-amber-500"
          />
          <StatCard
            label="Maintenance"
            value={units!.filter((u) => u.status === "maintenance").length}
            color="text-orange-500"
          />
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Home className="w-8 h-8 opacity-30" />
          <p className="text-sm">No units yet for this property.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ unitType, units: typeUnits }) => (
            <div
              key={unitType?.id ?? "uncategorised"}
              className="rounded-xl border bg-card p-6"
            >
              <UnitTypeSection
                unitType={unitType}
                units={typeUnits}
                propertyId={propertyId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
