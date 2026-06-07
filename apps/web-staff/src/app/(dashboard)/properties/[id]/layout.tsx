// apps/web-staff/src/app/(dashboard)/properties/[id]/layout.tsx
//
// Shared layout for all property sub-pages.
// Renders: breadcrumb back-link, property header, and the tab bar.
// Each tab link is a real Next.js route so the browser URL updates properly.

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Building2,
  Layers,
  FileText,
  CreditCard,
  Wrench,
  Users,
  Settings,
  ArrowLeft,
  MapPin,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProperty } from "@/hooks/use-properties";
import { useProperties, useWorkspace } from "@/hooks";
import { PROPERTY_TYPE_LABELS } from "./_shared/types";

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams<{ id: string }>();
  const { data: properties } = useProperties();
  const { buildWorkspaceUrl } = useWorkspace(properties ?? []);
  const { data: property, isLoading } = useProperty(id);

  return (
    <div className="space-y-0">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="space-y-4 p-4 md:p-8 pb-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={buildWorkspaceUrl("/properties")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Properties
          </Link>
          <span>/</span>
          {isLoading ? (
            <span className="text-foreground font-medium">Loading…</span>
          ) : (
            <span className="text-foreground font-medium">
              {property?.name ?? id}
            </span>
          )}
        </div>

        {/* Title row */}
        {isLoading ? (
          <div className="flex items-center gap-2 py-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading property…</span>
          </div>
        ) : property ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {property.name}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {property.address}, {property.city}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {PROPERTY_TYPE_LABELS[property.property_type] ??
                  property.property_type}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Property not found.</p>
        )}

      </div>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="p-4 md:p-8 pt-6">{children}</div>
    </div>
  );
}
