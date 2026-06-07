// apps/web-staff/src/app/(dashboard)/properties/[id]/_shared/types.ts
//
// All shared domain types, constants, and small pure helpers used across
// the property sub-pages (Overview, Units, Leases, Finance, Maintenance,
// Team, Settings).

import type { Property, UnitStatus } from "@emakao/api-types";

// ── Domain types ─────────────────────────────────────────────────────────────

export type PaymentMethodKind = "mpesa" | "bank" | "cash";
export interface PaymentMethod {
  method: PaymentMethodKind;
  account_number?: string;
  account_name?: string;
  instructions?: string;
}
export interface ServiceCharges {
  enabled: boolean;
  security_fee_kes: number;
  water_rate_per_unit: number;
  garbage_fee_kes: number;
  electricity_common_kes: number;
  other_fees: Array<{ name: string; amount: number }>;
}
export interface PropertyPolicies {
  payment_methods?: PaymentMethod[];
  agent_commission_percent?: number;
  late_fee_type?: "flat" | "percent";
  late_fee_value?: number;
  late_fee_grace_days?: number;
  deposit_months?: number;
  deposit_refund_days?: number;
  service_charges?: ServiceCharges;
}
export type PropertyWithPolicies = Omit<Property, "policies"> & {
  policies?: PropertyPolicies;
  maintenance?: { work_order_prefix: string; work_order_seq: number };
};

export interface UnitType {
  id: string;
  name: string;
  unit_type?: string | null;
  bedrooms: number;
  bathrooms: number;
  base_rent: string | null;
  base_deposit: string | null;
  quantity: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  multifamily: "Multifamily",
  commercial: "Commercial",
  community: "Community Association",
  student: "Student Housing",
  affordable_housing: "Affordable Housing",
  affordable: "Affordable Housing",
};

export const UNIT_STATUSES: { value: UnitStatus; label: string }[] = [
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Maintenance" },
  { value: "reserved", label: "Reserved" },
  { value: "inactive", label: "Inactive" },
];

export const UNIT_STATUS_CONFIG: Record<
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

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function isMultiUnit(type: string) {
  return !["residential"].includes(type);
}
