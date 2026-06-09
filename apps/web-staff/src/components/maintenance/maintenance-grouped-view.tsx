"use client";

import { useState } from "react";
import { ChevronDown, Flag, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  buildPeople,
  formatTimeline,
  ORDER_GROUPS,
  PRIORITY_META,
  shortId,
  STATUS_META,
} from "./maintenance-utils";
import type { WorkOrder, WorkOrderStatus } from "@/hooks/use-work-orders";
import { PeopleStack, StatusSelect } from "./maintenance-shared-components";

interface MaintenanceGroupedViewProps {
  orders: WorkOrder[];
  viewMode: "list" | "grid";
  staffMap: Map<string, { email: string; role: string }>;
  caretakerMap: Map<string, { name: string }>;
  propertyMap: Map<string, string>;
  showPropertyColumn: boolean;
  updatingOrderId: string | null;
  onOrderClick: (id: string) => void;
  onStatusChange: (id: string, status: WorkOrderStatus) => void;
}

export function MaintenanceGroupedView({
  orders,
  viewMode,
  staffMap,
  caretakerMap,
  propertyMap,
  showPropertyColumn,
  updatingOrderId,
  onOrderClick,
  onStatusChange,
}: MaintenanceGroupedViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<
    Record<(typeof ORDER_GROUPS)[number]["key"], boolean>
  >({
    open: true,
    inprogress: true,
    done: true,
  });

  const toggleGroup = (key: (typeof ORDER_GROUPS)[number]["key"]) => {
    setExpandedGroups((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return (
    <div className="space-y-4 w-full min-w-0 overflow-hidden">
      {ORDER_GROUPS.map((group) => {
        const groupOrders = orders.filter((order) =>
          (group.statuses as readonly string[]).includes(order.status),
        );

        return (
          <Card key={group.key} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/50 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", group.dotClass)} />
                  <span className="text-sm font-semibold text-foreground">
                    {group.label}
                  </span>
                </div>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {groupOrders.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => toggleGroup(group.key)}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    !expandedGroups[group.key] && "-rotate-90",
                  )}
                />
              </Button>
            </CardHeader>

            {expandedGroups[group.key] && (
              <>
                {viewMode === "list" ? (
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[980px] text-left text-sm">
                        <thead className="border-b bg-muted/30">
                          <tr>
                            <th className="w-12 px-4 py-3" />
                            <th className="px-4 py-3 font-medium text-muted-foreground">
                              Task
                            </th>
                            {showPropertyColumn && (
                              <th className="px-4 py-3 font-medium text-muted-foreground">
                                Property
                              </th>
                            )}
                            <th className="px-4 py-3 font-medium text-muted-foreground">
                              People
                            </th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">
                              Type
                            </th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">
                              Timeline
                            </th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">
                              Priority
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupOrders.map((order) => {
                            const people = buildPeople(
                              order,
                              staffMap,
                              caretakerMap,
                            );
                            const statusMeta = STATUS_META[order.status];
                            const priorityMeta = PRIORITY_META[order.priority];
                            const propertyName =
                              propertyMap.get(order.property_id) ??
                              shortId(order.property_id);

                            return (
                              <tr
                                key={order.id}
                                onClick={() => onOrderClick(order.id)}
                                className="cursor-pointer border-b last:border-b-0 hover:bg-muted/20"
                              >
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <GripVertical className="h-4 w-4" />
                                    <div
                                      className={cn(
                                        "h-3 w-3 rounded-full border",
                                        order.status === "completed"
                                          ? "border-emerald-500 bg-emerald-500"
                                          : "border-border",
                                      )}
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {order.title}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px]"
                                      >
                                        {order.code}
                                      </Badge>
                                    </div>
                                    <p className="max-w-[360px] truncate text-xs text-muted-foreground">
                                      {order.description ||
                                        "No description provided"}
                                    </p>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                      <span>
                                        {order.attachments.length} attachments
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {order.subtasks.length} subtasks
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                {showPropertyColumn && (
                                  <td className="px-4 py-4 text-sm text-muted-foreground">
                                    {propertyName}
                                  </td>
                                )}
                                <td className="px-4 py-4">
                                  <PeopleStack people={people} />
                                </td>
                                <td className="px-4 py-4">
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {order.category.replace("_", " ")}
                                  </Badge>
                                </td>
                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                  {formatTimeline(order)}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="space-y-2">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "font-medium",
                                        statusMeta.badgeClass,
                                      )}
                                    >
                                      {statusMeta.label}
                                    </Badge>
                                    <StatusSelect
                                      value={order.status}
                                      onChange={(status) =>
                                        onStatusChange(order.id, status)
                                      }
                                      disabled={updatingOrderId === order.id}
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "gap-1.5 font-medium",
                                      priorityMeta.className,
                                    )}
                                  >
                                    <Flag
                                      className={cn(
                                        "h-3 w-3",
                                        priorityMeta.iconClass,
                                      )}
                                    />
                                    {priorityMeta.label}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 p-6">
                    {groupOrders.map((order) => {
                      const people = buildPeople(order, staffMap, caretakerMap);
                      const statusMeta = STATUS_META[order.status];
                      const priorityMeta = PRIORITY_META[order.priority];
                      const propertyName =
                        propertyMap.get(order.property_id) ??
                        shortId(order.property_id);

                      return (
                        <Card
                          key={order.id}
                          className="cursor-pointer border-border/60 transition-all hover:border-primary/30 hover:shadow-sm"
                          onClick={() => onOrderClick(order.id)}
                        >
                          <CardHeader className="p-4 pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="h-5 px-1.5 text-[10px] font-bold"
                                  >
                                    {order.code}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "h-5 px-1.5 font-semibold text-[10px]",
                                      statusMeta.badgeClass,
                                    )}
                                  >
                                    {statusMeta.label}
                                  </Badge>
                                </div>
                                <CardTitle className="text-base font-bold">
                                  {order.title}
                                </CardTitle>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "gap-1 h-6 px-1.5 font-semibold text-[10px]",
                                  priorityMeta.className,
                                )}
                              >
                                <Flag
                                  className={cn(
                                    "h-3 w-3",
                                    priorityMeta.iconClass,
                                  )}
                                />
                                {priorityMeta.label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 p-4 pt-0">
                            <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                              {order.description || "No description provided"}
                            </CardDescription>
                            {showPropertyColumn && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Property
                                </p>
                                <p className="text-sm font-medium">
                                  {propertyName}
                                </p>
                              </div>
                            )}
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                People
                              </p>
                              <PeopleStack people={people} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Type
                                </p>
                                <p className="capitalize">
                                  {order.category.replace("_", " ")}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Timeline
                                </p>
                                <p>{formatTimeline(order)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Attachments
                                </p>
                                <p>{order.attachments.length}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Subtasks
                                </p>
                                <p>{order.subtasks.length}</p>
                              </div>
                            </div>
                            <div className="pt-1">
                              <p className="mb-2 text-xs text-muted-foreground">
                                Status
                              </p>
                              <StatusSelect
                                value={order.status}
                                onChange={(status) =>
                                  onStatusChange(order.id, status)
                                }
                                disabled={updatingOrderId === order.id}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </CardContent>
                )}
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
