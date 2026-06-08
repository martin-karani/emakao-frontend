"use client";

import * as React from "react";
import type { Property } from "@emakao/api-types";

interface PropertyRouteContextValue {
  property: Property;
  propertyId: string;
  propertySlug: string;
}

const PropertyRouteContext = React.createContext<PropertyRouteContextValue | null>(
  null
);

export function PropertyRouteProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PropertyRouteContextValue;
}) {
  return (
    <PropertyRouteContext.Provider value={value}>
      {children}
    </PropertyRouteContext.Provider>
  );
}

export function usePropertyRoute() {
  const context = React.useContext(PropertyRouteContext);
  if (!context) {
    throw new Error("usePropertyRoute must be used within PropertyRouteProvider");
  }
  return context;
}
