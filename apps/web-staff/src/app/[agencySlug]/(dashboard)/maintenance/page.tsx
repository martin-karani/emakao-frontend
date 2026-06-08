"use client";

import { Loader2 } from "lucide-react";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { WorkOrdersWorkspace } from "@/components/maintenance/work-orders-workspace";

export default function MaintenancePage() {
  const { data: orders = [], isLoading } = useWorkOrders();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <WorkOrdersWorkspace
        title="Maintenance"
        description="Track, review, and update work orders across your portfolio."
        orders={orders}
        showPropertyColumn
        defaultView="board"
        emptyTitle="No maintenance tasks yet"
        emptyDescription="Create your first work order to start tracking repairs, service requests, and follow-ups."
      />
    </div>
  );
}
