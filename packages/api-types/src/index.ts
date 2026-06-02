/**
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
export type CreateWorkOrderDto = components["schemas"]["CreateWorkOrderDto"];

// ── Residents ─────────────────────────────────────────────────────────────────
export type Resident = components["schemas"]["ResidentResponse"];

// ── Staff ─────────────────────────────────────────────────────────────────────
export type StaffUser = components["schemas"]["StaffUserResponse"];

// ── Owners ────────────────────────────────────────────────────────────────────
export type Owner = components["schemas"]["OwnerResponse"];

// ── Full bundle (advanced use: narrowing, type guards, etc.) ──────────────────
export type { components, paths } from "./schema";
