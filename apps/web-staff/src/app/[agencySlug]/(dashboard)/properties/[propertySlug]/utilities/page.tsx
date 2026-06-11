"use client";

import { useState } from "react";
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
import { Loader2, Plus, Droplets, Zap, Flame } from "lucide-react";
import { usePropertyRoute } from "../property-route-context";
import { useUnits } from "@/hooks/use-units";
import {
  useMeters,
  useBills,
  useCreateMeter,
  useRecordReading,
  useGenerateBill,
  type UtilityMeter,
  type MeterType,
  type BillingMode,
} from "@/hooks/use-utilities";
import { formatKES } from "@emakao/shared";

export default function PropertyUtilitiesPage() {
  const { propertyId } = usePropertyRoute();
  const { data: units, isLoading: isLoadingUnits } = useUnits(propertyId);

  // State for selected unit
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
    undefined,
  );
  const { data: meters, isLoading: isLoadingMeters } =
    useMeters(selectedUnitId);
  const { data: bills, isLoading: isLoadingBills } = useBills(selectedUnitId);

  // State for dialogs
  const [isCreateMeterOpen, setIsCreateMeterOpen] = useState(false);
  const [isRecordReadingOpen, setIsRecordReadingOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<UtilityMeter | null>(null);

  // Form state for create meter
  const [newMeterType, setNewMeterType] = useState<MeterType>("water");
  const [newMeterBillingMode, setNewMeterBillingMode] =
    useState<BillingMode>("postpaid");
  const [newMeterNumber, setNewMeterNumber] = useState("");
  const [newMeterRate, setNewMeterRate] = useState("");

  // Form state for record reading
  const [readingValue, setReadingValue] = useState("");

  const createMeterMutation = useCreateMeter();
  const recordReadingMutation = useRecordReading();
  const generateBillMutation = useGenerateBill();

  const handleCreateMeter = () => {
    if (!selectedUnitId || !newMeterNumber || !newMeterRate) return;
    createMeterMutation.mutate(
      {
        unit_id: selectedUnitId,
        meter_type: newMeterType,
        billing_mode: newMeterBillingMode,
        meter_number: newMeterNumber,
        rate_per_unit: parseFloat(newMeterRate),
      },
      {
        onSuccess: () => {
          setIsCreateMeterOpen(false);
          setNewMeterNumber("");
          setNewMeterRate("");
        },
      },
    );
  };

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

  const handleGenerateBill = (meterId: string) => {
    generateBillMutation.mutate(meterId, {
      onSuccess: () => {},
    });
  };

  const getMeterIcon = (type: MeterType) => {
    switch (type) {
      case "water":
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case "electricity":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "gas":
        return <Flame className="h-5 w-5 text-orange-500" />;
    }
  };

  const getMeterTypeLabel = (type: MeterType) => {
    switch (type) {
      case "water":
        return "Water";
      case "electricity":
        return "Electricity";
      case "gas":
        return "Gas";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Utilities</CardTitle>
          <CardDescription>
            Manage water, electricity, and gas meters, readings, and bills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Unit</Label>
              <Select
                value={selectedUnitId || ""}
                onValueChange={(value) => setSelectedUnitId(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
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

            {selectedUnitId && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Meters</h3>
                  <Button size="sm" onClick={() => setIsCreateMeterOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Meter
                  </Button>
                </div>

                {isLoadingMeters ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : meters && meters.length > 0 ? (
                  <div className="space-y-3">
                    {meters.map((meter) => (
                      <Card key={meter.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              {getMeterIcon(meter.meter_type)}
                              <div>
                                <CardTitle className="text-base">
                                  {getMeterTypeLabel(meter.meter_type)}
                                </CardTitle>
                                <CardDescription>
                                  Meter #{meter.meter_number}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {meter.billing_mode === "prepaid"
                                ? "Prepaid (Tokens)"
                                : "Postpaid"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Rate per Unit
                              </Label>
                              <p className="font-medium">
                                {formatKES(meter.rate_per_unit)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Created At
                              </Label>
                              <p className="font-medium">
                                {new Date(
                                  meter.created_at,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {meter.billing_mode === "postpaid" && (
                            <div className="flex gap-2">
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
                                onClick={() => handleGenerateBill(meter.id)}
                                disabled={generateBillMutation.isPending}
                              >
                                {generateBillMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Generate Bill"
                                )}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No meters for this unit yet.
                  </div>
                )}

                {meters && meters.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Bills</h3>
                    {isLoadingBills ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : bills && bills.length > 0 ? (
                      <div className="space-y-2">
                        {bills.map((bill) => (
                          <div
                            key={bill.id}
                            className="flex justify-between items-center p-3 rounded-lg border"
                          >
                            <div className="space-y-0.5">
                              <p className="font-medium">
                                {bill.units_consumed} units consumed
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(bill.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
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
                                className="text-xs"
                              >
                                {bill.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No bills for this unit yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Meter Dialog */}
      <Dialog
        open={isCreateMeterOpen}
        onOpenChange={(open) => setIsCreateMeterOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Meter</DialogTitle>
            <DialogDescription>
              Add a new utility meter for the selected unit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="space-y-2">
              <Label>Rate per Unit (KES)</Label>
              <Input
                type="number"
                value={newMeterRate}
                onChange={(e) => setNewMeterRate(e.target.value)}
                placeholder="0.00"
              />
            </div>
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
                !newMeterNumber ||
                !newMeterRate ||
                createMeterMutation.isPending
              }
            >
              {createMeterMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Add Meter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
