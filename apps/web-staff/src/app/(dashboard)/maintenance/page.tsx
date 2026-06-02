"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUpdateWorkOrder,
  useWorkOrders,
  type WorkOrderStatus,
  type WorkOrderPriority,
} from "@/hooks";

/** Tailwind classes keyed on backend WorkOrderPriority values (lowercase) */
const priorityColors: Record<WorkOrderPriority, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800 font-bold",
};

export default function MaintenancePage() {
  const { data: tickets, isLoading } = useWorkOrders();
  // useUpdateWorkOrder expects { id: string; body: UpdateWorkOrderDto }
  const updateMutation = useUpdateWorkOrder();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading tickets...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Maintenance Requests
          </h2>
          <p className="text-muted-foreground">
            Track and resolve tenant repair tickets.
          </p>
        </div>
        <Button>
          <Wrench className="w-4 h-4 mr-2" />
          Log Issue
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets?.map((ticket) => {
          const priorityClass =
            priorityColors[ticket.priority] ?? priorityColors.low;

          return (
            <div
              key={ticket.id}
              className="rounded-xl border bg-white text-card-foreground shadow-sm p-5 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold leading-none tracking-tight">
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticket.property_name} — Unit {ticket.unit_number}
                  </p>
                </div>
                <Badge className={priorityClass} variant="outline">
                  {ticket.priority}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {ticket.description}
              </p>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>

                {/* Status values match backend enum: open | inprogress | completed | cancelled */}
                <Select
                  defaultValue={ticket.status}
                  onValueChange={(val: WorkOrderStatus) =>
                    updateMutation.mutate({
                      id: ticket.id,
                      body: { status: val },
                    })
                  }
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}

        {(!tickets || tickets.length === 0) && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">All clear</h3>
            <p className="text-sm text-gray-500">
              No active maintenance requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
