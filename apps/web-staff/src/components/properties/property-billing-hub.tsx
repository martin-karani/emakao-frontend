"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Calculator,
  Droplets,
  Trash2,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface PropertyBillingSettings {
  property_id: string;
  rent_due_day: number;
  late_fee_type: "flat" | "percent";
  late_fee_value: number;
  late_fee_grace_days: number;
  water_rate_per_unit: number;
  garbage_fee_kes: number;
  security_fee_kes: number;
  other_fixed_fees: Record<string, unknown>;
}

export function PropertyBillingHub({ propertyId }: { propertyId: string }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PropertyBillingSettings | null>(
    null,
  );

  const { data: settings, isLoading } = useQuery({
    queryKey: ["property-billing-settings", propertyId],
    queryFn: async () => {
      const res = await fetch(
        `/api/proxy/api/v1/properties/${propertyId}/billing`,
      );
      if (!res.ok) throw new Error("Failed to fetch billing settings");
      const data = await res.json();
      setFormData(data);
      return data as PropertyBillingSettings;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PropertyBillingSettings) => {
      const res = await fetch(
        `/api/proxy/api/v1/properties/${propertyId}/billing`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) throw new Error("Failed to update settings");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-billing-settings", propertyId],
      });
      toast.success("Billing settings updated");
    },
    onError: () => {
      toast.error("Failed to update billing settings");
    },
  });

  if (isLoading || !formData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rent & Late Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Rent & Late Fees
            </CardTitle>
            <CardDescription>
              Configure when rent is due and how late fees are applied.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="rent_due_day">Rent Due Day (1-28)</Label>
              <Input
                id="rent_due_day"
                type="number"
                min={1}
                max={28}
                value={formData.rent_due_day}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rent_due_day: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="late_fee_grace_days">Grace Period (Days)</Label>
              <Input
                id="late_fee_grace_days"
                type="number"
                min={0}
                value={formData.late_fee_grace_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    late_fee_grace_days: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Late Fee Type</Label>
                <Select
                  value={formData.late_fee_type}
                  onValueChange={(v: string | null) => {
                    if (v === "flat" || v === "percent") {
                      setFormData({ ...formData, late_fee_type: v });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Amount</SelectItem>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={formData.late_fee_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      late_fee_value: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilities & Service Charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Utilities & Services
            </CardTitle>
            <CardDescription>
              Set property-wide rates and fixed monthly charges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                Water Rate (per unit)
              </Label>
              <Input
                type="number"
                value={formData.water_rate_per_unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    water_rate_per_unit: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-green-600" />
                Garbage Fee (KES)
              </Label>
              <Input
                type="number"
                value={formData.garbage_fee_kes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    garbage_fee_kes: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-700" />
                Security Fee (KES)
              </Label>
              <Input
                type="number"
                value={formData.security_fee_kes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    security_fee_kes: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Billing Settings
        </Button>
      </div>
    </div>
  );
}
