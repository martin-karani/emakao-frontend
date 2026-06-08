"use client";

import * as React from "react";
import { useWorkspace } from "@/hooks";
import { useProperties } from "@/hooks/use-properties";
import { useUnits, useUpdateUnit, useDeleteUnit } from "@/hooks/use-units";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatKES } from "@emakao/shared";
import {
  Plus,
  Loader2,
  Home,
  BedDouble,
  Bath,
  Ruler,
  DoorOpen,
  Layers,
  AlertCircle,
  Pencil,
} from "lucide-react";
import type { Unit, UnitStatus, UpdateUnitDto } from "@emakao/api-types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UnitType {
  id: string;
  name: string;
  /** Optional category label, e.g. "studio", "1br", "penthouse" */
  unit_type?: string | null;
  bedrooms: number;
  bathrooms: number;
  base_rent: string | null;
  base_deposit: string | null;
  quantity: number;
}

interface PropertyWithUnitTypes {
  id: string;
  name: string;
  unit_types?: UnitType[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  UnitStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    dot: string;
  }
> = {
  occupied: { label: "Occupied", variant: "default", dot: "bg-emerald-500" },
  vacant: { label: "Vacant", variant: "secondary", dot: "bg-amber-400" },
  maintenance: {
    label: "Maintenance",
    variant: "outline",
    dot: "bg-orange-500",
  },
  reserved: { label: "Reserved", variant: "outline", dot: "bg-blue-500" },
  inactive: { label: "Inactive", variant: "destructive", dot: "bg-zinc-400" },
};

function StatusBadge({ status }: { status: UnitStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;
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

// ── Edit sheet ────────────────────────────────────────────────────────────────

const STATUSES: { value: UnitStatus; label: string }[] = [
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Maintenance" },
  { value: "reserved", label: "Reserved" },
  { value: "inactive", label: "Inactive" },
];

function UnitEditSheet({
  unit,
  propertyId,
  open,
  onOpenChange,
}: {
  unit: Unit;
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateUnit(propertyId);

  const [form, setForm] = React.useState<{
    unit_number: string;
    floor: string;
    size_sqm: string;
    bedrooms: string;
    bathrooms: string;
    rent_amount_kes: string;
    deposit_kes: string;
    status: UnitStatus;
    description: string;
  }>({
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

  // Reset form whenever unit changes (e.g. after a successful save)
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
    value: form[name],
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
          {/* Unit number */}
          <div className="space-y-1.5">
            <Label htmlFor="unit_number">Unit Number</Label>
            <Input id="unit_number" {...field("unit_number")} />
          </div>

          {/* Status */}
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
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rent & Deposit */}
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

          {/* Floor & Size */}
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

          {/* Beds & Baths */}
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

          {/* Description */}
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

// ── Unit card ─────────────────────────────────────────────────────────────────

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
                    `Delete Unit ${unit.unit_number}? This cannot be undone.`
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

// ── Unit-type section ─────────────────────────────────────────────────────────

function UnitTypeSection({
  unitType,
  units,
  propertyId,
}: {
  unitType: UnitType | null; // null = "Uncategorised"
  units: Unit[];
  propertyId: string;
}) {
  const deleteMutation = useDeleteUnit(propertyId);

  const label = unitType?.name ?? "Uncategorised";
  const beds = unitType?.bedrooms;
  const baths = unitType?.bathrooms;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">{label}</h3>
          {beds != null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BedDouble className="w-3 h-3" />
              {beds}
              <Bath className="w-3 h-3 ml-1" />
              {baths}
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

      {/* Occupancy bar */}
      <OccupancyBar units={units} />

      {/* Unit cards */}
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

// ── Property block (agency mode) ──────────────────────────────────────────────

function PropertyUnitsBlock({ property }: { property: PropertyWithUnitTypes }) {
  const { data: units, isLoading } = useUnits(property.id);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-bold text-base">{property.name}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading units…
        </div>
      </div>
    );
  }

  const unitTypes: UnitType[] = (property.unit_types ?? []) as UnitType[];
  const grouped = groupByUnitType(units ?? [], unitTypes);

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-bold text-base">{property.name}</h2>
          <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {units?.length ?? 0} units
          </span>
        </div>
        {units && units.length > 0 && <OccupancyBar units={units} />}
      </div>

      {grouped.length === 0 ? (
        <EmptyUnits />
      ) : (
        <div className="divide-y space-y-6">
          {grouped.map(({ unitType, units: typeUnits }) => (
            <div
              key={unitType?.id ?? "uncategorised"}
              className="pt-6 first:pt-0"
            >
              <UnitTypeSection
                unitType={unitType}
                units={typeUnits}
                propertyId={property.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByUnitType(
  units: Unit[],
  unitTypes: UnitType[]
): { unitType: UnitType | null; units: Unit[] }[] {
  const typeMap = new Map<string, UnitType>(unitTypes.map((t) => [t.id, t]));

  // Group units by their unit_type_id
  const groups = new Map<string | null, Unit[]>();
  for (const unit of units) {
    const key = unit.unit_type_id ?? null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(unit);
  }

  const result: { unitType: UnitType | null; units: Unit[] }[] = [];

  // First: known unit types (in definition order)
  for (const ut of unitTypes) {
    const typeUnits = groups.get(ut.id) ?? [];
    result.push({ unitType: ut, units: typeUnits });
    groups.delete(ut.id);
  }

  // Then: uncategorised (unit_type_id is null or not in unitTypes)
  const uncategorised: Unit[] = [];
  for (const [, leftover] of groups) {
    uncategorised.push(...leftover);
  }
  if (uncategorised.length > 0) {
    result.push({ unitType: null, units: uncategorised });
  }

  return result;
}

function EmptyUnits() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
      <Home className="w-8 h-8 opacity-30" />
      <p className="text-sm">No units yet for this property.</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UnitsPage() {
  const { data: properties, isLoading: propsLoading } = useProperties();
  const { workspaceMode, activeProperty } = useWorkspace(properties ?? []);

  // ── Property workspace mode ───────────────────────────────────────────────
  if (workspaceMode === "property") {
    return (
      <PropertyWorkspaceView
        property={activeProperty as PropertyWithUnitTypes | undefined}
        isLoading={propsLoading}
      />
    );
  }

  // ── Agency mode: all properties ───────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHeader
        title="Portfolio Units"
        subtitle="All units across your properties, grouped by type."
      />

      {propsLoading ? (
        <LoadingState />
      ) : !properties?.length ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          No properties found. Add a property first.
        </div>
      ) : (
        <div className="space-y-6">
          {properties.map((p) => (
            <PropertyUnitsBlock
              key={p.id}
              property={p as PropertyWithUnitTypes}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Property workspace view ───────────────────────────────────────────────────

function PropertyWorkspaceView({
  property,
  isLoading,
}: {
  property: PropertyWithUnitTypes | undefined;
  isLoading: boolean;
}) {
  const { data: units, isLoading: unitsLoading } = useUnits(property?.id);

  if (isLoading || unitsLoading) return <LoadingState />;
  if (!property) {
    return (
      <div className="p-8 text-sm text-muted-foreground flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        No active property selected.
      </div>
    );
  }

  const unitTypes: UnitType[] = (property.unit_types ?? []) as UnitType[];
  const grouped = groupByUnitType(units ?? [], unitTypes);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <PageHeader
        title={`${property.name} — Units`}
        subtitle={`${units?.length ?? 0} unit${(units?.length ?? 0) !== 1 ? "s" : ""} · grouped by type`}
        action={
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
        }
      />

      {/* Summary row */}
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
        <EmptyUnits />
      ) : (
        <div className="space-y-8">
          {grouped.map(({ unitType, units: typeUnits }) => (
            <div
              key={unitType?.id ?? "uncategorised"}
              className="rounded-xl border bg-card p-6"
            >
              <UnitTypeSection
                unitType={unitType}
                units={typeUnits}
                propertyId={property.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Small reusable UI pieces ──────────────────────────────────────────────────

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {action}
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

function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground p-8">
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading…
    </div>
  );
}
