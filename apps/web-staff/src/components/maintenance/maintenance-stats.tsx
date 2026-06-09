"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkOrder } from "@/hooks/use-work-orders";

interface MaintenanceStatsProps {
  orders: WorkOrder[];
}

export function MaintenanceStats({ orders }: MaintenanceStatsProps) {
  const counts = {
    total: orders.length,
    open: orders.filter((order) => order.status === "open").length,
    inprogress: orders.filter((order) => order.status === "inprogress").length,
    done: orders.filter((order) =>
      ["completed", "cancelled"].includes(order.status)
    ).length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.total}</div>
          <p className="text-xs text-muted-foreground">
            All work orders from backend
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Not Started</CardTitle>
          <div className="h-2 w-2 rounded-full bg-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.open}</div>
          <p className="text-xs text-muted-foreground">Open maintenance tasks</p>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.inprogress}</div>
          <p className="text-xs text-muted-foreground">
            Tasks currently being worked
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Done</CardTitle>
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.done}</div>
          <p className="text-xs text-muted-foreground">Completed and cancelled</p>
        </CardContent>
      </Card>
    </div>
  );
}
