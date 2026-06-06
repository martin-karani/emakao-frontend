/**
 * packages/api-types/src/index.ts
 *
 * Named convenience re-exports from the generated OpenAPI schema.
 *
 * Add an entry here whenever a type is used across more than one app so
 * consumers can write `import type { Property } from "@emakao/api-types"`
 * instead of the verbose `components["schemas"]["PropertyResponse"]` form.
 *
 * Enums are exported alongside their parent response types so callers never
 * need to repeat the raw string unions.
 */
import type { components } from "./schema";

// ── Properties ────────────────────────────────────────────────────────────────
export type Property = components["schemas"]["PropertyResponse"];
export type PropertyType = components["schemas"]["PropertyType"];
export type CreatePropertyDto = components["schemas"]["CreatePropertyDto"];
export type UpdatePropertyDto = components["schemas"]["UpdatePropertyDto"];

// ── Agreements (leases) ───────────────────────────────────────────────────────
export type Agreement = components["schemas"]["AgreementResponse"];
export type AgreementStatus = components["schemas"]["AgreementStatus"];
export type BillingFrequency = components["schemas"]["BillingFrequency"];
export type CreateAgreementDto = components["schemas"]["CreateAgreementDto"];

// ── Invoices ──────────────────────────────────────────────────────────────────
export type Invoice = components["schemas"]["InvoiceResponse"];
export type InvoiceStatus = components["schemas"]["InvoiceStatus"];
export type InvoiceLineItem = components["schemas"]["InvoiceLineItem"];

// ── Bank statements & reconciliation ─────────────────────────────────────────
export type BankStatement = components["schemas"]["BankStatementResponse"];
export type BankStatementLine =
  components["schemas"]["BankStatementLineResponse"];
export type ReconciliationReport =
  components["schemas"]["ReconciliationReportResponse"];
export type ReconciliationStatus =
  components["schemas"]["ReconciliationStatus"];

// ── Work orders (maintenance) ─────────────────────────────────────────────────
export type WorkOrder = components["schemas"]["WorkOrderResponse"];
export type WorkOrderStatus = components["schemas"]["WorkOrderStatus"];
export type WorkOrderPriority = components["schemas"]["WorkOrderPriority"];
export type WorkOrderCategory = components["schemas"]["WorkOrderCategory"];
export type WorkOrderReporterType =
  components["schemas"]["WorkOrderReporterType"];
export type UpdateWorkOrderDto = components["schemas"]["UpdateWorkOrderDto"];

// ── Staff ─────────────────────────────────────────────────────────────────────
export type StaffUserResponse = components["schemas"]["StaffUserResponse"];
export type InviteStaffResponse = components["schemas"]["InviteStaffResponse"];

export type CreateWorkOrderDto = components["schemas"]["CreateWorkOrderDto"];

// ── Residents ─────────────────────────────────────────────────────────────────
export type Resident = components["schemas"]["ResidentResponse"];

// ── Staff ─────────────────────────────────────────────────────────────────────
export type StaffUser = components["schemas"]["StaffUserResponse"];

// ── Owners ────────────────────────────────────────────────────────────────────
export type Owner = components["schemas"]["OwnerResponse"];

// ── Units ─────────────────────────────────────────────────────────────────────
// Hand-crafted until the OpenAPI schema is regenerated after the backend
// unit endpoints are deployed.  Keep in sync with UnitResponse in
// src/presentation/http/responses/unit.rs.

export type UnitStatus =
  | "vacant"
  | "occupied"
  | "maintenance"
  | "reserved"
  | "inactive";

export interface Unit {
  id: string;
  property_id: string;
  parent_unit_id: string | null;
  unit_number: string;
  floor: number | null;
  size_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  /** Decimal string, e.g. "45000.00" */
  rent_amount_kes: string;
  /** Decimal string */
  deposit_kes: string;
  status: UnitStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitDto {
  unit_number: string;
  floor?: number | null;
  size_sqm?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  /** Decimal string or number */
  rent_amount_kes: string | number;
  deposit_kes?: string | number | null;
  description?: string | null;
}

export interface CreateUnitsDto {
  units: CreateUnitDto[];
}

export interface UpdateUnitDto {
  unit_number?: string;
  floor?: number | null;
  size_sqm?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  rent_amount_kes?: string | number;
  deposit_kes?: string | number;
  status?: UnitStatus;
  description?: string | null;
}

// ── Property config (mirrors Rust PropertyConfig discriminated union) ──────────

export type PropertyConfig =
  | { type: "single_family"; bedrooms: number; bathrooms: number }
  | { type: "multifamily"; floors: number; parking_spaces: number }
  | {
      type: "commercial";
      cam_rate: number;
      building_class: "A" | "B" | "C";
    }
  | {
      type: "community_association";
      due_billing_cycle: "Monthly" | "Quarterly" | "SemiAnnual" | "Annual";
      board_seats: number;
    }
  | {
      type: "student_housing";
      campus_proximity_km: number;
      semester_start_month: number;
    }
  | {
      type: "affordable_housing";
      program_id: string;
      ami_percentage: number;
    };

// ── Full bundle (advanced use: narrowing, type guards, etc.) ──────────────────
export type { components, paths } from "./schema";
