"use client";

import { useState } from "react";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { Loader2 } from "lucide-react";
import { WorkOrdersWorkspace } from "@/components/maintenance/work-orders-workspace";
import { usePropertyRoute } from "../property-route-context";

export default function PropertyMaintenancePage() {
  const { propertyId, property } = usePropertyRoute();
  const { data: orders = [], isLoading } = useWorkOrders({
    property_id: propertyId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <WorkOrdersWorkspace
        title={`${property?.name || "Property"} Maintenance`}
        description="Manage maintenance tasks for this property."
        orders={orders}
        propertyId={propertyId}
        defaultView="board"
        emptyTitle="No tasks for this property"
        emptyDescription="Create a work order to start tracking maintenance for this property."
      />
    </div>
  );
}
