// apps/web-staff/src/app/(dashboard)/properties/[id]/settings/page.tsx
//
// Property settings tab: profile edit, communications, payment methods,
// fee policies, service charges, and maintenance tracking.

"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v4";
import {
  Loader2,
  Building2,
  MapPin,
  Edit,
  X,
  Save,
  Camera,
  Banknote,
  Percent,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

import { useProperty, useUpdateProperty } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatementBroadcastButton } from "@/components/shared/statement-broadcast-button";
import { BroadcastNoticeModal } from "@/components/shared/broadcast-notice-modal";

import {
  PROPERTY_TYPE_LABELS,
  PropertyWithPolicies,
  isMultiUnit,
} from "../_shared/types";
import { formatKES } from "@emakao/shared";

// ── Edit form ─────────────────────────────────────────────────────────────────

const editSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
});
type EditFormValues = z.infer<typeof editSchema>;

function PropertyProfileCard({ property }: { property: PropertyWithPolicies }) {
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const updateProperty = useUpdateProperty();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: property.name,
      address: property.address,
      city: property.city,
    },
  });

  const handleSave = async (values: EditFormValues) => {
    setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateProperty.mutateAsync({ id: property.id, dto: values as any });
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update property"
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5" /> Profile & Location
          </CardTitle>
          <CardDescription>Basic information and address</CardDescription>
        </div>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              setEditing(false);
              setSaveError(null);
            }}
          >
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <form
            onSubmit={handleSubmit(handleSave)}
            className="space-y-4"
            noValidate
          >
            <Field data-invalid={!!errors.name || undefined}>
              <Label htmlFor="e-name">Name</Label>
              <Input id="e-name" {...register("name")} />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.address || undefined}>
                <Label htmlFor="e-address">Address</Label>
                <Input id="e-address" {...register("address")} />
                {errors.address && (
                  <FieldError>{errors.address.message}</FieldError>
                )}
              </Field>
              <Field data-invalid={!!errors.city || undefined}>
                <Label htmlFor="e-city">City</Label>
                <Input id="e-city" {...register("city")} />
                {errors.city && <FieldError>{errors.city.message}</FieldError>}
              </Field>
            </div>
            {saveError && (
              <Alert variant="destructive">
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={updateProperty.isPending} size="sm">
              {updateProperty.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save changes
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {property.address}, {property.city}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {PROPERTY_TYPE_LABELS[property.property_type] ??
                  property.property_type}
              </Badge>
              {property.country_code && (
                <Badge variant="outline">{property.country_code}</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useProperty(id);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
      </div>
    );
  }

  if (!property) {
    return (
      <p className="text-sm text-muted-foreground">Property not found.</p>
    );
  }

  const p = property as PropertyWithPolicies;
  const policies = p.policies ?? {};
  const paymentMethods = policies.payment_methods ?? [];
  const serviceCharges = policies.service_charges;

  return (
    <div className="space-y-6 max-w-3xl">
      <PropertyProfileCard property={p} />

      {/* Statement broadcasts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5" /> Communications
          </CardTitle>
          <CardDescription>Send bulk notices to all residents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatementBroadcastButton propertyId={id} />
          <BroadcastNoticeModal propertyId={id} />
        </CardContent>
      </Card>

      {/* Payment methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Banknote className="w-5 h-5" /> Payment Methods
          </CardTitle>
          <CardDescription>
            Accepted payment channels for this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payment methods configured.
            </p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((pm, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-3 space-y-1 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {pm.method}
                    </Badge>
                    {pm.account_name && (
                      <span className="font-medium">{pm.account_name}</span>
                    )}
                  </div>
                  {pm.account_number && (
                    <p className="text-muted-foreground">
                      Account: {pm.account_number}
                    </p>
                  )}
                  {pm.instructions && (
                    <p className="text-muted-foreground">{pm.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="w-5 h-5" /> Fee Policies
          </CardTitle>
          <CardDescription>
            Late fees, deposits and agent commissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {policies.agent_commission_percent != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agent commission</span>
              <span className="font-medium">
                {policies.agent_commission_percent}%
              </span>
            </div>
          )}
          {policies.late_fee_value != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Late fee</span>
              <span className="font-medium">
                {policies.late_fee_type === "percent"
                  ? `${policies.late_fee_value}%`
                  : formatKES(policies.late_fee_value)}{" "}
                {policies.late_fee_grace_days != null &&
                  `(${policies.late_fee_grace_days}d grace)`}
              </span>
            </div>
          )}
          {policies.deposit_months != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit</span>
              <span className="font-medium">{policies.deposit_months} months</span>
            </div>
          )}
          {!policies.agent_commission_percent &&
            !policies.late_fee_value &&
            !policies.deposit_months && (
              <p className="text-muted-foreground">
                No fee policies configured.
              </p>
            )}
        </CardContent>
      </Card>

      {/* Service charges */}
      {serviceCharges?.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="w-5 h-5" /> Service Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: "Security fee", val: serviceCharges.security_fee_kes },
              {
                label: "Water (per unit)",
                val: serviceCharges.water_rate_per_unit,
              },
              { label: "Garbage fee", val: serviceCharges.garbage_fee_kes },
              {
                label: "Electricity (common)",
                val: serviceCharges.electricity_common_kes,
              },
            ].map(
              ({ label, val }) =>
                val > 0 && (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{formatKES(val)}</span>
                  </div>
                )
            )}
            {serviceCharges.other_fees?.map((f, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{f.name}</span>
                <span className="font-medium">{formatKES(f.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Maintenance tracking */}
      {isMultiUnit(property.property_type) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5" /> Maintenance Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {p.maintenance ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Work order prefix
                  </span>
                  <span className="font-mono font-medium">
                    {p.maintenance.work_order_prefix}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next sequence</span>
                  <span className="font-medium">
                    #{p.maintenance.work_order_seq}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Maintenance tracking not yet configured.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Property ID: <span className="font-mono">{property.id}</span>
        </p>
        <p>Created: {new Date(property.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
