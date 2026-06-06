"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v4";
import {
  ArrowLeft,
  Building2,
  Edit,
  Loader2,
  MapPin,
  Save,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { LiveUnitList } from "@/components/properties/unit-list";
import { StatementBroadcastButton } from "@/components/shared/statement-broadcast-button";
import { BroadcastNoticeModal } from "@/components/shared/broadcast-notice-modal";
import { PropertyNotificationHub } from "@/components/properties/property-notification-hub";
import { PropertyBillingHub } from "@/components/properties/property-billing-hub";
import { useProperty, useUpdateProperty } from "@/hooks/use-properties";
import type { Property } from "@emakao/api-types";

interface UpdatedProperty extends Property {
  maintenance: {
    work_order_prefix: string;
    work_order_seq: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  multifamily: "Multifamily",
  commercial: "Commercial",
  community: "Community Association",
  student: "Student Housing",
  affordable_housing: "Affordable Housing",
  affordable: "Affordable Housing",
};

function isMultiUnit(type: string) {
  return !["residential"].includes(type);
}

function renderConfig(config: Record<string, unknown>) {
  if (!config) return null;
  const { type: _type, ...fields } = config;
  return Object.entries(fields).map(([key, val]) => (
    <div key={key} className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground capitalize">
        {key.replace(/_/g, " ")}
      </span>
      <span className="font-medium">{String(val)}</span>
    </div>
  ));
}

// ── Edit form schema ──────────────────────────────────────────────────────────

const editSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
});
type EditFormValues = z.infer<typeof editSchema>;

// ── Property info card ────────────────────────────────────────────────────────

function PropertyInfoCard({ property }: { property: Property }) {
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
      await updateProperty.mutateAsync({ id: property.id, dto: values });
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update property",
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5" />
            Property Details
          </CardTitle>
          <CardDescription>
            Basic information about this property
          </CardDescription>
        </div>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
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
            <X className="w-4 h-4 mr-1" />
            Cancel
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

            {saveError && (
              <Alert variant="destructive">
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={updateProperty.isPending} size="sm">
              {updateProperty.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>
                {property.address}, {property.city}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">
                {PROPERTY_TYPE_LABELS[property.property_type] ??
                  property.property_type}
              </Badge>
              <Badge variant="outline">{property.country_code}</Badge>
              <span className="text-xs text-muted-foreground">
                Prefix:{" "}
                <code className="bg-muted px-1 rounded">
                  {
                    (property as unknown as UpdatedProperty).maintenance
                      .work_order_prefix
                  }
                </code>
              </span>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Configuration
              </p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {renderConfig(property.config as any)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Simple tab bar (no @/components/ui/tabs) ──────────────────────────────────

type Tab = "overview" | "units" | "notifications" | "billing";

function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "units", label: "Units" },
    { id: "notifications", label: "Notifications" },
    { id: "billing", label: "Billing & Utilities" },
  ];
  return (
    <div className="flex border-b gap-1">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={[
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const propertyId = params.id;

  const activeTab = (searchParams.get("tab") as Tab) || "overview";

  const handleTabChange = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/properties/${propertyId}?${params.toString()}`);
  };

  const { data: property, isLoading, error } = useProperty(propertyId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Property not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  const singleUnit = !isMultiUnit(property.property_type);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/properties")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {property.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {property.address}, {property.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BroadcastNoticeModal propertyId={property.id} />
          <StatementBroadcastButton propertyId={property.id} />
        </div>
      </div>

      {/* Tab bar */}
      <TabBar active={activeTab} onChange={handleTabChange} />

      {/* Overview tab */}
      {activeTab === "overview" && <PropertyInfoCard property={property} />}

      {/* Units tab */}
      {activeTab === "units" && (
        <Card>
          <CardHeader>
            <CardTitle>Units</CardTitle>
            <CardDescription>
              {singleUnit
                ? "This single-family property has one unit."
                : "All lettable units in this property."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LiveUnitList propertyId={propertyId} singleUnit={singleUnit} />
          </CardContent>
        </Card>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <Card>
          <CardContent className="pt-6">
            <PropertyNotificationHub propertyId={propertyId} />
          </CardContent>
        </Card>
      )}

      {/* Billing tab */}
      {activeTab === "billing" && (
        <Card>
          <CardContent className="pt-6">
            <PropertyBillingHub propertyId={propertyId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
