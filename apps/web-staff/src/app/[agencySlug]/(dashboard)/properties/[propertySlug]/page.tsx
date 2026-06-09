// apps/web-staff/src/app/(dashboard)/properties/[id]/page.tsx
//
// Overview tab for a single property.
// The shared layout (layout.tsx) renders the property header + tab bar;
// this page only renders the overview grid content.

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Loader2,
  Building2,
  MapPin,
  Edit,
  Layers,
  FileText,
  Wrench,
  CreditCard,
  Users,
  Settings,
  Banknote,
  Percent,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PROPERTY_TYPE_LABELS,
  PropertyWithPolicies,
  isMultiUnit,
} from "./_shared/types";
import { formatKES } from "@emakao/shared";
import { usePropertyRoute } from "./property-route-context";
import { usePropertySummary } from "@/hooks/use-properties";

interface PropertySummaryDetail {
  generated_at: string;
  property_id: string;
  name: string;
  slug: string;
  stats: {
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate_pct: number;
    active_leases: number;
    open_work_orders: number;
  };
  expiring_leases: Array<{
    agreement_id: string;
    unit_id: string;
    unit_number: string;
    resident_name: string;
    end_date: string;
    days_until_expiry: number;
    rent_amount_kes: string;
  }>;
  pending_maintenance: Array<{
    work_order_id: string;
    code: string;
    title: string;
    priority: string;
    status: string;
    unit_number: string;
    created_at: string;
    days_open: number;
  }>;
  rent_collection: {
    total_expected_kes: string;
    total_collected_kes: string;
    outstanding_kes: string;
    collection_rate_pct: string;
  };
}

export default function PropertyOverviewPage() {
  const { agencySlug } = useParams<{ agencySlug: string }>();
  const { property, propertyId, propertySlug } = usePropertyRoute();
  const { data: summary, isLoading: isLoadingSummary } = usePropertySummary(
    propertyId,
  ) as { data: PropertySummaryDetail | undefined; isLoading: boolean };

  const config = property.config as Record<string, unknown> | undefined;
  const configEntries = config
    ? Object.entries(config).filter(([k]) => k !== "type")
    : [];

  const p = property as PropertyWithPolicies;
  const policies = p.policies ?? {};
  const paymentMethods = policies.payment_methods ?? [];
  const serviceCharges = policies.service_charges;

  const quickActions = [
    {
      label: "Units",
      href: `/${agencySlug}/properties/${propertySlug}/units`,
      icon: Layers,
    },
    {
      label: "Leases",
      href: `/${agencySlug}/properties/${propertySlug}/leases`,
      icon: FileText,
    },
    {
      label: "Work Orders",
      href: `/${agencySlug}/properties/${propertySlug}/maintenance`,
      icon: Wrench,
    },
    {
      label: "Finance",
      href: `/${agencySlug}/properties/${propertySlug}/finance`,
      icon: CreditCard,
    },
    {
      label: "Team",
      href: `/${agencySlug}/properties/${propertySlug}/team`,
      icon: Users,
    },
    {
      label: "Settings",
      href: `/${agencySlug}/properties/${propertySlug}/settings`,
      icon: Settings,
    },
  ];

  if (isLoadingSummary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.stats?.occupancy_rate_pct}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.stats?.occupied_units} / {summary?.stats?.total_units}{" "}
              units occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rent Collected
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.rent_collection?.collection_rate_pct}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatKES(
                (summary?.rent_collection?.total_collected_kes as string) ??
                  "0",
              )}{" "}
              collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Work Orders
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.stats?.open_work_orders ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.pending_maintenance?.length ?? 0} active orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.expiring_leases?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Leases ending in 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <CardTitle className="text-base">Property Profile</CardTitle>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  href={`/${agencySlug}/properties/${propertySlug}/settings`}
                />
              }
            >
              <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
          </CardContent>
        </Card>

        {/* Config card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {configEntries.length > 0 ? (
              configEntries.map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-muted-foreground">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium">{String(val)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No extra configuration.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick-action cards */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-sm font-medium text-center hover:bg-muted/60 transition-colors"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                {label}
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Expiring Leases List (if any) */}
        {summary &&
          summary.expiring_leases &&
          summary.expiring_leases.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Leases Expiring Soon
                </CardTitle>
                <CardDescription>
                  Active agreements ending in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.expiring_leases.map((lease) => (
                    <div
                      key={lease.agreement_id}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium">
                          Unit {lease.unit_number} — {lease.resident_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ends {new Date(lease.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatKES(lease.rent_amount_kes)}
                        </p>
                        <Badge
                          variant={
                            lease.days_until_expiry <= 7
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {lease.days_until_expiry} days left
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Pending Maintenance List (if any) */}
        {summary &&
          summary.pending_maintenance &&
          summary.pending_maintenance.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Urgent Work Orders</CardTitle>
                <CardDescription>
                  Active maintenance requests for this property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.pending_maintenance.map((wo) => (
                    <div
                      key={wo.work_order_id}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {wo.code}
                          </span>
                          <p className="font-medium">{wo.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Unit {wo.unit_number} • Opened{" "}
                          {new Date(wo.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            wo.priority === "emergency"
                              ? "destructive"
                              : "outline"
                          }
                          className="capitalize text-[10px]"
                        >
                          {wo.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {wo.days_open} days open
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Payment methods */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Banknote className="w-4 h-4 text-muted-foreground" /> Payment
              Methods
            </CardTitle>
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
                    className="rounded-lg border p-3 space-y-1 text-sm bg-muted/20"
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
                        Account:{" "}
                        <span className="font-medium text-foreground">
                          {pm.account_number}
                        </span>
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Percent className="w-4 h-4 text-muted-foreground" /> Fee Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {policies.agent_commission_percent != null && (
              <div className="flex justify-between items-center py-1 border-b last:border-0 border-dashed">
                <span className="text-muted-foreground">Agent commission</span>
                <span className="font-medium">
                  {policies.agent_commission_percent}%
                </span>
              </div>
            )}
            {policies.late_fee_value != null && (
              <div className="flex justify-between items-center py-1 border-b last:border-0 border-dashed">
                <span className="text-muted-foreground">Late fee</span>
                <span className="font-medium">
                  {policies.late_fee_type === "percent"
                    ? `${policies.late_fee_value}%`
                    : formatKES(policies.late_fee_value)}{" "}
                  {policies.late_fee_grace_days != null && (
                    <span className="text-muted-foreground font-normal">
                      ({policies.late_fee_grace_days}d grace)
                    </span>
                  )}
                </span>
              </div>
            )}
            {policies.deposit_months != null && (
              <div className="flex justify-between items-center py-1 border-b last:border-0 border-dashed">
                <span className="text-muted-foreground">Deposit</span>
                <span className="font-medium">
                  {policies.deposit_months} months
                </span>
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />{" "}
                Service Charges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
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
                    <div
                      key={label}
                      className="flex justify-between py-1 border-b last:border-0 border-dashed"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{formatKES(val)}</span>
                    </div>
                  ),
              )}
              {serviceCharges.other_fees?.map(
                (f: { name: string; amount: number }, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between py-1 border-b last:border-0 border-dashed"
                  >
                    <span className="text-muted-foreground">{f.name}</span>
                    <span className="font-medium">{formatKES(f.amount)}</span>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        )}

        {/* Maintenance tracking */}
        {isMultiUnit(property.property_type) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4 text-muted-foreground" />{" "}
                Maintenance Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {p.maintenance ? (
                <>
                  <div className="flex justify-between py-1 border-b last:border-0 border-dashed">
                    <span className="text-muted-foreground">
                      Work order prefix
                    </span>
                    <span className="font-mono font-medium">
                      {p.maintenance.work_order_prefix}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b last:border-0 border-dashed">
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
      </div>
    </div>
  );
}
