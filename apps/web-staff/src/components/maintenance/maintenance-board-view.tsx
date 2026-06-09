"use client";

import { Clock3, Flag, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  buildPeople,
  formatTimeline,
  ORDER_GROUPS,
  PRIORITY_META,
  shortId,
} from "./maintenance-utils";
import type { WorkOrder } from "@/hooks/use-work-orders";
import { PeopleStack } from "./maintenance-shared-components";

interface MaintenanceBoardViewProps {
  orders: WorkOrder[];
  staffMap: Map<string, { email: string; role: string }>;
  caretakerMap: Map<string, { name: string }>;
  propertyMap: Map<string, string>;
  showPropertyColumn: boolean;
  onOrderClick: (id: string) => void;
}

export function MaintenanceBoardView({
  orders,
  staffMap,
  caretakerMap,
  propertyMap,
  showPropertyColumn,
  onOrderClick,
}: MaintenanceBoardViewProps) {
  return (
    <div className="flex-1 min-h-0 w-full">
      <div className="flex h-full gap-6 overflow-x-auto pb-6">
        {ORDER_GROUPS.map((group) => {
          const groupOrders = orders.filter((order) =>
            (group.statuses as readonly string[]).includes(order.status)
          );

          return (
            <div
              key={group.key}
              className="flex w-[320px] shrink-0 flex-col gap-4 rounded-lg border bg-muted/40 p-3"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", group.dotClass)} />
                  <span className="text-sm font-semibold text-foreground">
                    {group.label}
                  </span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {groupOrders.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                {groupOrders.map((order) => {
                  const people = buildPeople(order, staffMap, caretakerMap);
                  const priorityMeta = PRIORITY_META[order.priority];
                  const propertyName =
                    propertyMap.get(order.property_id) ??
                    shortId(order.property_id);

                  return (
                    <Card
                      key={order.id}
                      size="sm"
                      className="cursor-pointer border-border/60 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                      onClick={() => onOrderClick(order.id)}
                    >
                      <CardHeader className="p-3 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[9px] font-bold tracking-tight"
                          >
                            {order.code}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 px-1.5 gap-1 text-[9px] font-bold",
                              priorityMeta.className
                            )}
                          >
                            <Flag
                              className={cn("h-2.5 w-2.5", priorityMeta.iconClass)}
                            />
                            {priorityMeta.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm leading-tight">
                          {order.title}
                        </CardTitle>
                        {order.description && (
                          <p className="line-clamp-2 text-[11px] text-muted-foreground">
                            {order.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3 p-3 pt-0">
                        {showPropertyColumn && (
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {propertyName}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <PeopleStack people={people} />
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock3 className="h-3 w-3" />
                            {formatTimeline(order)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 border-t pt-2 text-[10px] text-muted-foreground">
                          <span>{order.attachments.length} files</span>
                          <span>{order.subtasks.length} tasks</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
