// apps/web-staff/src/lib/schemas/property.ts
//
// Shared Zod schemas and TypeScript types for the property onboarding wizard.
// Kept in lib/ so they can be imported by both page.tsx and its sub-components
// without creating circular dependency chains.

import * as z from "zod/v4";

// ── Config sub-schemas ────────────────────────────────────────────────────────

export const configSchema = z
  .object({
    floors: z.number().int().min(1).optional(),
    parking_spaces: z.number().int().min(0).optional(),
    cam_rate: z.number().min(0).optional(),
    building_class: z.enum(["A", "B", "C"]).optional(),
    due_billing_cycle: z
      .enum(["Monthly", "Quarterly", "SemiAnnual", "Annual"])
      .optional(),
    board_seats: z.number().int().min(1).optional(),
    campus_proximity_km: z.number().min(0).optional(),
    semester_start_month: z.number().int().min(1).max(12).optional(),
    program_id: z.string().optional(),
    ami_percentage: z.number().int().min(0).max(100).optional(),
  })
  .passthrough();

export const unitSchema = z.object({
  unit_number: z.string().min(1, "Unit number is required").max(50),
  floor: z.number().int().min(-10).max(200).nullable().optional(),
  size_sqm: z.number().min(0).nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  rent_amount_kes: z.number().min(0, "Rent must be ≥ 0"),
  deposit_kes: z.number().min(0).optional().default(0),
  description: z.string().max(2000).optional(),
});

export const unitTypeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Type name is required"),
  /** Free-form category, e.g. "studio", "1br", "penthouse". */
  unit_type: z.string().optional().nullable(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  base_rent: z.number().min(0).optional(),
  base_deposit: z.number().min(0).optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const newTeamMemberSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  property_type: z.enum([
    "residential",
    "multifamily",
    "commercial",
    "community",
    "student",
    "affordable_housing",
  ] as const),
  config: configSchema,
  unit_types: z.array(unitTypeSchema).default([]),
  photos: z.array(z.string()).default([]),
  documents: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.string(),
        document_type: z.string().min(1).optional(),
      }),
    )
    .default([]),
  owner_ids: z.array(z.string().uuid()).default([]),
  agent_ids: z.array(z.string().uuid()).default([]),
  new_owners: z.array(newTeamMemberSchema).default([]),
  new_caretakers: z.array(newTeamMemberSchema).default([]),
});

export type UnitFieldValues = z.infer<typeof unitSchema>;
export type PropertyFormValues = z.infer<typeof propertySchema>;

// ── Constants ─────────────────────────────────────────────────────────────────

/** Types that allow many units. Single-family ("residential") is the exception. */
export const MULTI_UNIT_TYPES = new Set([
  "multifamily",
  "commercial",
  "community",
  "student",
  "affordable_housing",
]);

export function isMultiUnit(type: string) {
  return MULTI_UNIT_TYPES.has(type);
}

/** Mirrors the Rust `candidate_prefix` function. */
export function derivePrefix(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return initials.slice(0, 6) || "PROP";
}
