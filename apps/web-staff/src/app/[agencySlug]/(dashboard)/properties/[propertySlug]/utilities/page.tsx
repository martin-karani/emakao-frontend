"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Droplets,
  Zap,
  Flame,
  Layers,
  BedDouble,
  Bath,
  Trash2,
} from "lucide-react";
import { usePropertyRoute } from "../property-route-context";
import { useUnits } from "@/hooks/use-units";
import {
  UTILITY_KEYS,
  useCreateMeter,
  useRecordReading,
  useGenerateBill,
  type UtilityMeter,
  type MeterType,
  type BillingMode,
  type UtilityBill,
} from "@/hooks/use-utilities";
import {
  UnitType,
  PropertyWithPolicies,
  ServiceCharges,
} from "../_shared/types";
import type { Unit } from "@emakao/api-types";
import { formatKES } from "@emakao/shared";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function proxyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ??
        `Request failed with status ${res.status}`,
    );
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
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

function getMeterIcon(type: MeterType) {
  switch (type) {
    case "water":
      return <Droplets className="h-4 w-4 text-blue-500" />;
    case "electricity":
      return <Zap className="h-4 w-4 text-yellow-500" />;
    case "gas":
      return <Flame className="h-4 w-4 text-orange-500" />;
  }
}

function getMeterTypeLabel(type: MeterType) {
  switch (type) {
    case "water":
      return "Water";
    case "electricity":
      return "Electricity";
    case "gas":
      return "Gas";
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UnitUtilities({
  unit,
  selectedMonth,
  onAddMeter,
  serviceCharges,
}: {
  unit: Unit;
  selectedMonth: Date;
  onAddMeter: (unitId: string) => void;
  serviceCharges?: ServiceCharges;
}) {
  const queryClient = useQueryClient();

  const metersQuery = useQuery({
    queryKey: UTILITY_KEYS.meters(unit.id),
    queryFn: () =>
      proxyFetch<UtilityMeter[]>(`/api/v1/meters?unit_id=${unit.id}`),
    enabled: !!unit.id,
  });

  const billsQuery = useQuery({
    queryKey: UTILITY_KEYS.bills(unit.id),
    queryFn: () =>
      proxyFetch<UtilityBill[]>(`/api/v1/utility-bills?unit_id=${unit.id}`),
    enabled: !!unit.id,
  });

  const recordReadingMutation = useRecordReading();
  const generateBillMutation = useGenerateBill();

  const [isRecordReadingOpen, setIsRecordReadingOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<UtilityMeter | null>(null);
  const [readingValue, setReadingValue] = useState("");

  const handleRecordReading = () => {
    if (!selectedMeter?.id || !readingValue) return;
    recordReadingMutation.mutate(
      {
        meter_id: selectedMeter.id,
        reading_value: parseFloat(readingValue),
      },
      {
        onSuccess: () => {
          setIsRecordReadingOpen(false);
          setReadingValue("");
        },
      },
    );
  };

  const meters = metersQuery.data ?? [];
  const bills = billsQuery.data ?? [];

  return (
    <Card key={unit.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Unit {unit.unit_number}</CardTitle>
            <CardDescription>
              {selectedMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddMeter(unit.id)}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Meter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-4">
        {/* Garbage Fee */}
        {serviceCharges &&
          serviceCharges.garbage_fee_kes != null &&
          serviceCharges.garbage_fee_kes > 0 && (
            <div className="border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-gray-500" />
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Garbage Collection</p>
                  <p className="text-xs text-muted-foreground">
                    Fixed monthly fee
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Fixed
                </Badge>
                <p className="font-bold text-sm">
                  {formatKES(serviceCharges.garbage_fee_kes)}
                </p>
              </div>
            </div>
          )}

        {metersQuery.isLoading || billsQuery.isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : meters.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No meters for this unit.
          </div>
        ) : (
          <div className="space-y-3">
            {meters.map((meter) => {
              // Get common rate for this meter type
              let rate: number | null = null;
              if (meter.meter_type === "water") {
                rate = serviceCharges?.water_rate_per_unit ?? null;
              } else if (meter.meter_type === "electricity") {
                rate = serviceCharges?.electricity_common_kes ?? null;
              } else {
                rate = meter.rate_per_unit;
              }

              return (
                <div
                  key={meter.id}
                  className="border rounded-lg p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMeterIcon(meter.meter_type)}
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">
                          {getMeterTypeLabel(meter.meter_type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{meter.meter_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {meter.billing_mode === "prepaid"
                          ? "Prepaid (Tokens)"
                          : "Postpaid"}
                      </Badge>
                      {rate != null && (
                        <p className="font-bold text-sm">
                          {formatKES(rate)}/unit
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bills for this meter */}
                  {bills.filter((bill) => bill.meter_id === meter.id).length >
                    0 && (
                    <div className="mt-2 space-y-1.5">
                      {bills
                        .filter((bill) => bill.meter_id === meter.id)
                        .map((bill) => (
                          <div
                            key={bill.id}
                            className="flex items-center justify-between text-xs bg-muted rounded p-2"
                          >
                            <div className="space-y-0.5">
                              <p className="font-medium">
                                {bill.units_consumed} units
                              </p>
                              <p className="text-muted-foreground">
                                {new Date(bill.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right space-y-0.5">
                              <p className="font-bold">
                                {formatKES(bill.amount_kes)}
                              </p>
                              <Badge
                                variant={
                                  bill.status === "paid"
                                    ? "outline"
                                    : bill.status === "overdue"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-[10px]"
                              >
                                {bill.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {meter.billing_mode === "postpaid" && (
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMeter(meter);
                          setIsRecordReadingOpen(true);
                        }}
                      >
                        Record Reading
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          generateBillMutation.mutate(meter.id, {
                            onSuccess: () => {
                              queryClient.invalidateQueries({
                                queryKey: UTILITY_KEYS.bills(unit.id),
                              });
                            },
                          });
                        }}
                        disabled={generateBillMutation.isPending}
                      >
                        {generateBillMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : null}
                        Generate Bill
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Record Reading Dialog */}
      <Dialog
        open={isRecordReadingOpen}
        onOpenChange={(open) => setIsRecordReadingOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Meter Reading</DialogTitle>
            <DialogDescription>
              Enter the current reading for {selectedMeter?.meter_type} meter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reading Value</Label>
              <Input
                type="number"
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRecordReadingOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordReading}
              disabled={!readingValue || recordReadingMutation.isPending}
            >
              {recordReadingMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Record Reading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function UnitSection({
  unitType,
  units,
  selectedMonth,
  onAddMeter,
  serviceCharges,
}: {
  unitType: UnitType | null;
  units: Unit[];
  selectedMonth: Date;
  onAddMeter: (unitId: string) => void;
  serviceCharges?: ServiceCharges;
}) {
  const label = unitType?.name ?? "Uncategorised";

  return (
    <div className="space-y-6">
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
        <Button size="sm" onClick={() => onAddMeter("")}>
          <Plus className="mr-2 h-4 w-4" /> Add Meter
        </Button>
      </div>

      <div className="space-y-4">
        {units.map((unit) => (
          <UnitUtilities
            key={unit.id}
            unit={unit}
            selectedMonth={selectedMonth}
            onAddMeter={onAddMeter}
            serviceCharges={serviceCharges}
          />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PropertyUtilitiesPage() {
  const { property, propertyId } = usePropertyRoute();
  const { data: units, isLoading: isLoadingUnits } = useUnits(propertyId);
  const propertyWithPolicies = property as PropertyWithPolicies;
  const unitTypes = (property?.unit_types ?? []) as UnitType[];
  const serviceCharges = propertyWithPolicies.policies?.service_charges;

  const createMeterMutation = useCreateMeter();

  // Month state
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // State for create meter dialog
  const [isCreateMeterOpen, setIsCreateMeterOpen] = useState(false);
  const [selectedUnitForMeter, setSelectedUnitForMeter] = useState<
    string | null
  >(null);
  const [newMeterType, setNewMeterType] = useState<MeterType>("water");
  const [newMeterBillingMode, setNewMeterBillingMode] =
    useState<BillingMode>("postpaid");
  const [newMeterNumber, setNewMeterNumber] = useState("");

  const handleCreateMeter = () => {
    if (!selectedUnitForMeter || !newMeterNumber) return;

    // Get common rate
    let rate = 0;
    if (newMeterType === "water") {
      rate = serviceCharges?.water_rate_per_unit ?? 0;
    } else if (newMeterType === "electricity") {
      rate = serviceCharges?.electricity_common_kes ?? 0;
    }

    createMeterMutation.mutate(
      {
        unit_id: selectedUnitForMeter,
        meter_type: newMeterType,
        billing_mode: newMeterBillingMode,
        meter_number: newMeterNumber,
        rate_per_unit: rate,
      },
      {
        onSuccess: () => {
          setIsCreateMeterOpen(false);
          setNewMeterNumber("");
        },
      },
    );
  };

  if (isLoadingUnits) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  const grouped = groupByUnitType(units ?? [], unitTypes);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Utilities</CardTitle>
              <CardDescription>
                Manage water, electricity, and gas meters, readings, and bills.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Month
              </Label>
              <Select
                value={`${selectedMonth.getFullYear()}-${String(
                  selectedMonth.getMonth() + 1,
                ).padStart(2, "0")}`}
                onValueChange={(value) => {
                  if (!value) return;
                  const [year, month] = value.split("-").map(Number);
                  setSelectedMonth(new Date(year, month - 1));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    return d;
                  }).map((d) => (
                    <SelectItem
                      key={`${d.getFullYear()}-${d.getMonth()}`}
                      value={`${d.getFullYear()}-${String(
                        d.getMonth() + 1,
                      ).padStart(2, "0")}`}
                    >
                      {d.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {serviceCharges && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {serviceCharges.water_rate_per_unit != null &&
                serviceCharges.water_rate_per_unit > 0 && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Water Rate</p>
                    <p className="font-medium">
                      {formatKES(serviceCharges.water_rate_per_unit)}/unit
                    </p>
                  </div>
                )}
              {serviceCharges.electricity_common_kes != null &&
                serviceCharges.electricity_common_kes > 0 && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Electricity</p>
                    <p className="font-medium">
                      {formatKES(serviceCharges.electricity_common_kes)}
                    </p>
                  </div>
                )}
              {serviceCharges.garbage_fee_kes != null &&
                serviceCharges.garbage_fee_kes > 0 && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Garbage Fee</p>
                    <p className="font-medium">
                      {formatKES(serviceCharges.garbage_fee_kes)}
                    </p>
                  </div>
                )}
              {serviceCharges.security_fee_kes != null &&
                serviceCharges.security_fee_kes > 0 && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Security</p>
                    <p className="font-medium">
                      {formatKES(serviceCharges.security_fee_kes)}
                    </p>
                  </div>
                )}
            </div>
          )}
        </CardHeader>
      </Card>

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Zap className="w-8 h-8 opacity-30" />
          <p className="text-sm">No units yet for this property.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ unitType, units: typeUnits }) => (
            <div
              key={unitType?.id ?? "uncategorised"}
              className="rounded-xl border bg-card p-6"
            >
              <UnitSection
                unitType={unitType}
                units={typeUnits}
                selectedMonth={selectedMonth}
                onAddMeter={(unitId) => {
                  setSelectedUnitForMeter(unitId || (typeUnits[0]?.id ?? null));
                  setIsCreateMeterOpen(true);
                }}
                serviceCharges={serviceCharges}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create Meter Dialog */}
      <Dialog
        open={isCreateMeterOpen}
        onOpenChange={(open) => setIsCreateMeterOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Utility Meter</DialogTitle>
            <DialogDescription>
              Add a new utility meter to a unit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={selectedUnitForMeter || ""}
                onValueChange={(val) => setSelectedUnitForMeter(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unit {unit.unit_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meter Type</Label>
              <Select
                value={newMeterType}
                onValueChange={(val) => setNewMeterType(val as MeterType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Billing Mode</Label>
              <Select
                value={newMeterBillingMode}
                onValueChange={(val) =>
                  setNewMeterBillingMode(val as BillingMode)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postpaid">Postpaid</SelectItem>
                  <SelectItem value="prepaid">Prepaid (Tokens)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meter Number</Label>
              <Input
                value={newMeterNumber}
                onChange={(e) => setNewMeterNumber(e.target.value)}
                placeholder="Enter meter number"
              />
            </div>
            {/* Display common rate info */}
            {serviceCharges && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Common Rates</p>
                <div className="space-y-1 mt-1 text-sm">
                  {serviceCharges.water_rate_per_unit != null &&
                    serviceCharges.water_rate_per_unit > 0 && (
                      <div className="flex justify-between">
                        <span>Water</span>
                        <span className="font-medium">
                          {formatKES(serviceCharges.water_rate_per_unit)}/unit
                        </span>
                      </div>
                    )}
                  {serviceCharges.electricity_common_kes != null &&
                    serviceCharges.electricity_common_kes > 0 && (
                      <div className="flex justify-between">
                        <span>Electricity</span>
                        <span className="font-medium">
                          {formatKES(serviceCharges.electricity_common_kes)}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateMeterOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMeter}
              disabled={
                !selectedUnitForMeter ||
                !newMeterNumber ||
                createMeterMutation.isPending
              }
            >
              {createMeterMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
