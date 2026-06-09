"use client";

import { useMemo, useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useUpdateWorkOrder,
  type WorkOrder,
  type WorkOrderStatus,
} from "@/hooks/use-work-orders";
import { useProperties } from "@/hooks/use-properties";
import { useCaretakers } from "@/hooks/use-caretakers";
import { useStaff } from "@/hooks/use-staff";
import { WorkOrderSheet } from "@/components/maintenance/work-order-sheet";
import { CreateWorkOrderSheet } from "@/components/maintenance/create-work-order-sheet";
import { toast } from "sonner";

import { MaintenanceStats } from "./maintenance-stats";
import {
  MaintenanceViewSwitcher,
  type ViewMode,
} from "./maintenance-view-switcher";
import { MaintenanceBoardView } from "./maintenance-board-view";
import { MaintenanceGroupedView } from "./maintenance-grouped-view";

interface WorkOrdersWorkspaceProps {
  title: string;
  description: string;
  orders: WorkOrder[];
  propertyId?: string;
  showPropertyColumn?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  defaultView?: ViewMode;
}

export function WorkOrdersWorkspace({
  title,
  description,
  orders,
  propertyId,
  showPropertyColumn = false,
  emptyTitle,
  emptyDescription,
  defaultView = "list",
}: WorkOrdersWorkspaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const { data: properties } = useProperties();
  const { data: caretakers } = useCaretakers(propertyId);
  const { data: staff } = useStaff();
  const updateWorkOrder = useUpdateWorkOrder();

  const propertyMap = useMemo(
    () =>
      new Map(
        (properties ?? []).map((property) => [property.id, property.name]),
      ),
    [properties],
  );
  const caretakerMap = useMemo(
    () =>
      new Map(
        (caretakers ?? []).map((caretaker) => [
          caretaker.id,
          { name: `${caretaker.first_name} ${caretaker.last_name}`.trim() },
        ]),
      ),
    [caretakers],
  );
  const staffMap = useMemo(
    () =>
      new Map(
        (staff ?? []).map((person) => [
          person.user_id,
          { email: person.email, role: person.role },
        ]),
      ),
    [staff],
  );

  const selectedOrder = selectedOrderId
    ? (orders.find((order) => order.id === selectedOrderId) ?? null)
    : null;

  const handleStatusChange = async (
    orderId: string,
    status: WorkOrderStatus,
  ) => {
    setUpdatingOrderId(orderId);
    try {
      await updateWorkOrder.mutateAsync({
        id: orderId,
        body: { status },
      });
      toast.success("Task status updated");
    } catch {
      toast.error("Failed to update task status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MaintenanceViewSwitcher
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <MaintenanceStats orders={orders} />

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-base font-medium">{emptyTitle}</p>
            <p className="max-w-md text-sm text-muted-foreground">
              {emptyDescription}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "board" ? (
        <MaintenanceBoardView
          orders={orders}
          staffMap={staffMap}
          caretakerMap={caretakerMap}
          propertyMap={propertyMap}
          showPropertyColumn={showPropertyColumn}
          onOrderClick={setSelectedOrderId}
        />
      ) : (
        <MaintenanceGroupedView
          orders={orders}
          viewMode={viewMode}
          staffMap={staffMap}
          caretakerMap={caretakerMap}
          propertyMap={propertyMap}
          showPropertyColumn={showPropertyColumn}
          updatingOrderId={updatingOrderId}
          onOrderClick={setSelectedOrderId}
          onStatusChange={handleStatusChange}
        />
      )}

      <WorkOrderSheet
        workOrder={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
        staffMap={staffMap}
        caretakerMap={caretakerMap}
      />

      <CreateWorkOrderSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        propertyId={propertyId}
      />
    </div>
  );
}
