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
  Loader2, Building2, MapPin, Edit, Layers, FileText, Wrench, CreditCard, Users, Settings,
  Banknote, Percent, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PROPERTY_TYPE_LABELS, PropertyWithPolicies, isMultiUnit } from "./_shared/types";
import { formatKES } from "@emakao/shared";
import { usePropertyRoute } from "./property-route-context";

export default function PropertyOverviewPage() {
  const { agencySlug } = useParams<{ agencySlug: string }>();
  const { property, propertySlug } = usePropertyRoute();

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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Profile card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <CardTitle className="text-base">Property Profile</CardTitle>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/${agencySlug}/properties/${propertySlug}/settings`} />}
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

      {/* Payment methods */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="w-4 h-4 text-muted-foreground" /> Payment Methods
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
                      Account: <span className="font-medium text-foreground">{pm.account_number}</span>
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
                {policies.late_fee_grace_days != null &&
                  <span className="text-muted-foreground font-normal">({policies.late_fee_grace_days}d grace)</span>}
              </span>
            </div>
          )}
          {policies.deposit_months != null && (
            <div className="flex justify-between items-center py-1 border-b last:border-0 border-dashed">
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" /> Service Charges
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
                  <div key={label} className="flex justify-between py-1 border-b last:border-0 border-dashed">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{formatKES(val)}</span>
                  </div>
                )
            )}
            {serviceCharges.other_fees?.map((f, i) => (
              <div key={i} className="flex justify-between py-1 border-b last:border-0 border-dashed">
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-muted-foreground" /> Maintenance Tracking
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
  );
}
