"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePropertyBySlug } from "@/hooks/use-properties";
import { PROPERTY_TYPE_LABELS } from "./_shared/types";
import {
  PropertyRouteProvider,
  usePropertyRoute,
} from "./property-route-context";

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { agencySlug, propertySlug } = useParams<{
    agencySlug: string;
    propertySlug: string;
  }>();
  const { data: property, isLoading, isError } = usePropertyBySlug(propertySlug);

  if (isLoading) {
    return (
      <div className="space-y-0">
        <div className="space-y-4 p-4 pb-0 md:p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Properties
            </span>
            <span>/</span>
            <span className="text-foreground font-medium">Loading...</span>
          </div>
          <div className="flex items-center gap-2 py-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading property...</span>
          </div>
        </div>
        <div className="p-4 pt-6 md:p-8" />
      </div>
    );
  }

  if (!property || isError) {
    return (
      <div className="space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/${agencySlug}/properties`}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Properties
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">Property not found.</p>
      </div>
    );
  }

  return (
    <PropertyRouteProvider
      value={{
        property,
        propertyId: property.id,
        propertySlug,
      }}
    >
      <PropertyScaffold agencySlug={agencySlug}>{children}</PropertyScaffold>
    </PropertyRouteProvider>
  );
}

function PropertyScaffold({
  agencySlug,
  children,
}: {
  agencySlug: string;
  children: React.ReactNode;
}) {
  const { property } = usePropertyRoute();

  return (
    <div className="space-y-0">
      <div className="space-y-4 p-4 pb-0 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/${agencySlug}/properties`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Properties
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{property.name}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {property.address}, {property.city}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {PROPERTY_TYPE_LABELS[property.property_type] ?? property.property_type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 pt-6 md:p-8">{children}</div>
    </div>
  );
}
