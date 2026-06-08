"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Columns,
  Flag,
  GripVertical,
  LayoutGrid,
  List as ListIcon,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/date-format";
import {
  useUpdateWorkOrder,
  type WorkOrder,
  type WorkOrderStatus,
} from "@/hooks/use-work-orders";
import { useProperties } from "@/hooks/use-properties";
import { useCaretakers } from "@/hooks/use-caretakers";
import { useStaff } from "@/hooks/use-staff";
import {
  buildPeople,
  formatTimeline,
  getInitials,
  ORDER_GROUPS,
  PRIORITY_META,
  shortId,
  STATUS_META,
} from "./maintenance-utils";
import type { PersonChip } from "./maintenance-utils";
import { WorkOrderSheet } from "@/components/maintenance/work-order-sheet";
import { CreateWorkOrderSheet } from "@/components/maintenance/create-work-order-sheet";
import { toast } from "sonner";

type ViewMode = "list" | "grid" | "board";

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: WorkOrderStatus;
  onChange: (status: WorkOrderStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Select
        value={value}
        onValueChange={(status) => onChange(status as WorkOrderStatus)}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 w-[148px] rounded-lg border-border/60 bg-background text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_META).map(([status, meta]) => (
            <SelectItem key={status} value={status} className="text-xs">
              {meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PeopleStack({ people }: { people: PersonChip[] }) {
  if (people.length === 0) {
    return <span className="text-xs text-muted-foreground">Unassigned</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {people.slice(0, 3).map((person) => (
          <Avatar
            key={person.id}
            className="h-7 w-7 border-2 border-background ring-1 ring-border/40"
          >
            <AvatarFallback className="bg-muted text-[10px] font-semibold">
              {person.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {people.length > 3 ? (
        <span className="text-xs text-muted-foreground">
          +{people.length - 3}
        </span>
      ) : null}
    </div>
  );
}

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
  const [expandedGroups, setExpandedGroups] = useState<
    Record<(typeof ORDER_GROUPS)[number]["key"], boolean>
  >({
    open: true,
    inprogress: true,
    done: true,
  });
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

  const counts = {
    total: orders.length,
    open: orders.filter((order) => order.status === "open").length,
    inprogress: orders.filter((order) => order.status === "inprogress").length,
    done: orders.filter((order) =>
      ["completed", "cancelled"].includes(order.status),
    ).length,
  };

  const toggleGroup = (key: (typeof ORDER_GROUPS)[number]["key"]) => {
    setExpandedGroups((previous) => ({ ...previous, [key]: !previous[key] }));
  };

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
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-lg border bg-muted p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ListIcon className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                viewMode === "board"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Columns className="h-4 w-4" />
              Board
            </button>
          </div>

          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

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
            <p className="text-xs text-muted-foreground">
              Open maintenance tasks
            </p>
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
            <p className="text-xs text-muted-foreground">
              Completed and cancelled
            </p>
          </CardContent>
        </Card>
      </div>

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
        <div className="flex h-[calc(100vh-280px)] min-h-[500px] gap-6 overflow-x-auto pb-6">
          {ORDER_GROUPS.map((group) => {
            const groupOrders = orders.filter((order) =>
              group.statuses.includes(order.status),
            );

            return (
              <div
                key={group.key}
                className="flex w-[320px] shrink-0 flex-col gap-4 rounded-lg border bg-muted/40 p-3"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("h-2 w-2 rounded-full", group.dotClass)}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {group.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[10px]"
                    >
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
                        onClick={() => setSelectedOrderId(order.id)}
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
                                priorityMeta.className,
                              )}
                            >
                              <Flag
                                className={cn(
                                  "h-2.5 w-2.5",
                                  priorityMeta.iconClass,
                                )}
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
      ) : (
        <div className="space-y-4">
          {ORDER_GROUPS.map((group) => {
            const groupOrders = orders.filter((order) =>
              group.statuses.includes(order.status),
            );

            return (
              <Card key={group.key} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/50 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("h-2 w-2 rounded-full", group.dotClass)}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {group.label}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[10px]"
                    >
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

                {expandedGroups[group.key] ? (
                  viewMode === "list" ? (
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-sm">
                          <thead className="border-b bg-muted/30">
                            <tr>
                              <th className="w-12 px-4 py-3" />
                              <th className="px-4 py-3 font-medium text-muted-foreground">
                                Task
                              </th>
                              {showPropertyColumn ? (
                                <th className="px-4 py-3 font-medium text-muted-foreground">
                                  Property
                                </th>
                              ) : null}
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
                              const priorityMeta =
                                PRIORITY_META[order.priority];
                              const propertyName =
                                propertyMap.get(order.property_id) ??
                                shortId(order.property_id);

                              return (
                                <tr
                                  key={order.id}
                                  onClick={() => setSelectedOrderId(order.id)}
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
                                  {showPropertyColumn ? (
                                    <td className="px-4 py-4 text-sm text-muted-foreground">
                                      {propertyName}
                                    </td>
                                  ) : null}
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
                                          handleStatusChange(order.id, status)
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
                    <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                          <Card
                            key={order.id}
                            className="cursor-pointer border-border/60 transition-all hover:border-primary/30 hover:shadow-sm"
                            onClick={() => setSelectedOrderId(order.id)}
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
                              {showPropertyColumn ? (
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    Property
                                  </p>
                                  <p className="text-sm font-medium">
                                    {propertyName}
                                  </p>
                                </div>
                              ) : null}
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
                                    handleStatusChange(order.id, status)
                                  }
                                  disabled={updatingOrderId === order.id}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  )
                ) : null}
              </Card>
            );
          })}
        </div>
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
