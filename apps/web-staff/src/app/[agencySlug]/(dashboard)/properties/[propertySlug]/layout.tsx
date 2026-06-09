"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";
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
  const {
    data: property,
    isLoading,
    isError,
  } = usePropertyBySlug(propertySlug);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading property...</p>
      </div>
    );
  }

  if (!property || isError) {
    return (
      <div className="space-y-4 p-4 md:p-8">
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
  children,
}: {
  agencySlug: string;
  children: React.ReactNode;
}) {
  const { property } = usePropertyRoute();

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
