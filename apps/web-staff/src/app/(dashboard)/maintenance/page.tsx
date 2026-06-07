"use client";

import { useState } from "react";
import {
  useWorkOrders,
  useCreateWorkOrder,
  type WorkOrder,
  type WorkOrderStatus,
  type WorkOrderPriority,
  type WorkOrderCategory,
} from "@/hooks/use-work-orders";
import { useProperties } from "@/hooks/use-properties";
import { useUnits } from "@/hooks/use-units";
import { useCaretakers } from "@/hooks/use-caretakers";
import {
  SearchSelectDialog,
  type SearchResult,
} from "@/components/shared/search-select-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Wrench,
  Filter,
  User,
  Calendar,
  Tag,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/date-format";
import { WorkOrderSheet } from "@/components/maintenance/work-order-sheet";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "plumbing",
  "electrical",
  "structural",
  "hvac",
  "appliance",
  "painting",
  "cleaning",
  "security",
  "landscaping",
  "pest_control",
  "general",
];

const STATUS_GROUPS: {
  status: WorkOrderStatus;
  label: string;
  dotClass: string;
  badgeClass: string;
  headerClass: string;
}[] = [
  {
    status: "open",
    label: "Not Started",
    dotClass: "bg-orange-400",
    badgeClass:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    headerClass: "text-orange-700 dark:text-orange-400",
  },
  {
    status: "inprogress",
    label: "In Progress",
    dotClass: "bg-indigo-400",
    badgeClass:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    headerClass: "text-indigo-700 dark:text-indigo-400",
  },
  {
    status: "completed",
    label: "Done",
    dotClass: "bg-emerald-400",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    headerClass: "text-emerald-700 dark:text-emerald-400",
  },
  {
    status: "cancelled",
    label: "Cancelled",
    dotClass: "bg-rose-400",
    badgeClass:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
    headerClass: "text-rose-700 dark:text-rose-400",
  },
];

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: {
    label: "Lowest",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  medium: {
    label: "Normal",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  high: {
    label: "Urgent",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  emergency: {
    label: "Emergency",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

// ── WorkOrderRow ──────────────────────────────────────────────────────────────

function WorkOrderRow({
  order,
  onClick,
}: {
  order: WorkOrder;
  onClick: () => void;
}) {
  const priority = PRIORITY_CONFIG[order.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <tr
      onClick={onClick}
      className="group border-b border-border/50 last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
    >
      {/* Checkbox col */}
      <td className="py-2.5 pl-4 pr-2 w-8">
        <div className="w-4 h-4 rounded border border-muted-foreground/30 group-hover:border-muted-foreground/60 transition-colors" />
      </td>

      {/* Title + code */}
      <td className="py-2.5 pr-3 min-w-0 max-w-[260px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{order.title}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {order.code}
        </span>
      </td>

      {/* Description */}
      <td className="py-2.5 pr-4 hidden md:table-cell">
        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
          {order.description || <span className="italic">No description</span>}
        </p>
      </td>

      {/* Assignee */}
      <td className="py-2.5 pr-4 hidden lg:table-cell w-28">
        {order.assigned_caretaker_id ? (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
              <User className="w-3 h-3" />
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        )}
      </td>

      {/* Category */}
      <td className="py-2.5 pr-4 hidden xl:table-cell w-28">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="w-3 h-3" />
          <span className="capitalize">{order.category.replace("_", " ")}</span>
        </div>
      </td>

      {/* Date */}
      <td className="py-2.5 pr-4 hidden lg:table-cell w-32">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {formatShortDate(order.created_at)}
        </div>
      </td>

      {/* Priority */}
      <td className="py-2.5 pr-4 w-24">
        <Badge
          variant="outline"
          className={cn("text-[10px] h-5 font-medium", priority.className)}
        >
          {priority.label}
        </Badge>
      </td>

      {/* Actions */}
      <td className="py-2.5 pr-3 w-8">
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </td>
    </tr>
  );
}

// ── StatusGroup ───────────────────────────────────────────────────────────────

function StatusGroup({
  group,
  orders,
  onSelect,
}: {
  group: (typeof STATUS_GROUPS)[0];
  orders: WorkOrder[];
  onSelect: (o: WorkOrder) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Group header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}

        <span
          className={cn(
            "flex items-center gap-2 text-sm font-semibold",
            group.headerClass,
          )}
        >
          <span className={cn("w-2.5 h-2.5 rounded-full", group.dotClass)} />
          {group.label}
        </span>

        <Badge
          variant="outline"
          className={cn(
            "ml-1 text-[10px] h-5 font-semibold tabular-nums min-w-[22px] justify-center",
            group.badgeClass,
          )}
        >
          {orders.length}
        </Badge>
      </button>

      {/* Table */}
      {!collapsed && (
        <div className="border-t border-border">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No {group.label.toLowerCase()} work orders
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="py-2 pl-4 pr-2 w-8" />
                  <th className="py-2 pr-3 text-left text-xs font-medium text-muted-foreground">
                    Task Name
                  </th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Description
                  </th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell w-28">
                    Assignee
                  </th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell w-28">
                    Category
                  </th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell w-32">
                    Date
                  </th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground w-24">
                    Priority
                  </th>
                  <th className="py-2 pr-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <WorkOrderRow
                    key={order.id}
                    order={order}
                    onClick={() => onSelect(order)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filters, setFilters] = useState<{
    property_id?: string;
    status?: WorkOrderStatus;
  }>({});

  const { data: properties } = useProperties();
  const { data: tickets = [], isLoading } = useWorkOrders(filters);

  const searchProperties = async (q: string): Promise<SearchResult[]> => {
    const res = await fetch(
      `/api/proxy/api/v1/properties?q=${encodeURIComponent(q)}&limit=10`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id: string;
      name: string;
      address: string;
      city: string;
    }>;
    return data.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: `${p.address}, ${p.city}`,
      data: p,
    }));
  };

  const searchUnits = async (q: string): Promise<SearchResult[]> => {
    if (!newTicket.property_id) return [];
    const res = await fetch(
      `/api/proxy/api/v1/properties/${newTicket.property_id}/units?q=${encodeURIComponent(q)}&limit=10`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id: string;
      unit_number: string;
      description?: string;
    }>;
    return data.map((u) => ({
      id: u.id,
      title: `Unit ${u.unit_number}`,
      subtitle: u.description,
      data: u,
    }));
  };

  const searchCaretakers = async (q: string): Promise<SearchResult[]> => {
    const res = await fetch(
      `/api/proxy/api/v1/caretakers?q=${encodeURIComponent(q)}&limit=10`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id: string;
      first_name: string;
      last_name: string;
      email?: string;
      phone?: string;
    }>;
    return data.map((c) => ({
      id: c.id,
      title: `${c.first_name} ${c.last_name}`,
      subtitle: c.email || c.phone,
      data: c,
    }));
  };

  const createMutation = useCreateWorkOrder();

  const [newTicket, setNewTicket] = useState({
    property_id: "",
    unit_id: "",
    caretaker_id: "",
    title: "",
    description: "",
    category: "general" as WorkOrderCategory,
    priority: "medium" as WorkOrderPriority,
  });

  const { data: units } = useUnits(newTicket.property_id || undefined);

  const handleCreate = async () => {
    if (!newTicket.property_id || !newTicket.title) {
      toast.error("Property and Title are required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        ...newTicket,
        unit_id: newTicket.unit_id || undefined,
        caretaker_id: newTicket.caretaker_id || undefined,
        reporter_type: "staff",
      } as Parameters<typeof createMutation.mutateAsync>[0]);
      toast.success("Work order created successfully");
      setIsCreateOpen(false);
      setNewTicket({
        property_id: "",
        unit_id: "",
        caretaker_id: "",
        title: "",
        description: "",
        category: "general",
        priority: "medium",
      });
    } catch {
      toast.error("Failed to create work order");
    }
  };

  const handleSelectOrder = (order: WorkOrder) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  // Group tickets by status
  const grouped = STATUS_GROUPS.map((g) => ({
    ...g,
    orders: tickets.filter((t) => t.status === g.status),
  }));

  const totalCount = tickets.length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 min-h-0">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            Maintenance &amp; Work Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track, assign, and resolve property maintenance requests.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 text-sm shadow-sm">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground border-r pr-2 mr-1">
            Filter
          </span>

          <SearchSelectDialog
            title="Filter by Property"
            placeholder="Search property name..."
            searchFn={searchProperties}
            onSelect={(p: unknown) => {
              const prop = p as { id: string };
              setFilters({ ...filters, property_id: prop.id });
            }}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 gap-1"
              >
                {filters.property_id
                  ? properties?.find((p) => p.id === filters.property_id)
                      ?.name || "Property"
                  : "All Properties"}
              </Button>
            }
          />

          {filters.property_id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setFilters({ ...filters, property_id: undefined })}
            >
              <Plus className="h-3 w-3 rotate-45" />
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading...
            </span>
          ) : (
            <span>
              {totalCount} task{totalCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-xl bg-muted/20 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
          <h3 className="text-base font-semibold">
            Everything&apos;s in order
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            No active maintenance requests match your filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {grouped.map((group) => (
            <StatusGroup
              key={group.status}
              group={group}
              orders={group.orders}
              onSelect={handleSelectOrder}
            />
          ))}
        </div>
      )}

      {/* ── Work order sheet (slide-over) ── */}
      <WorkOrderSheet
        workOrder={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* ── Create dialog ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Log Maintenance Issue</DialogTitle>
            <DialogDescription>
              Create a new work order to track a repair or service request.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Property *</Label>
                <SearchSelectDialog
                  title="Select Property"
                  placeholder="Search property name..."
                  searchFn={searchProperties}
                  onSelect={(p: unknown) => {
                    const prop = p as { id: string };
                    setNewTicket({
                      ...newTicket,
                      property_id: prop.id,
                      unit_id: "",
                      caretaker_id: "",
                    });
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-sm"
                    >
                      {newTicket.property_id
                        ? properties?.find(
                            (p) => p.id === newTicket.property_id,
                          )?.name || "Property Selected"
                        : "Select property"}
                    </Button>
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Unit (Optional)</Label>
                <SearchSelectDialog
                  title="Select Unit"
                  placeholder="Search unit number..."
                  searchFn={searchUnits}
                  onSelect={(u: unknown) => {
                    const unit = u as { id: string };
                    setNewTicket({ ...newTicket, unit_id: unit.id });
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-sm"
                      disabled={!newTicket.property_id}
                    >
                      {newTicket.unit_id
                        ? (units?.find((u) => u.id === newTicket.unit_id)
                            ?.unit_number ?? "Unit Selected")
                        : newTicket.property_id
                          ? "Select unit"
                          : "Select property first"}
                    </Button>
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Caretaker (Optional)</Label>
              <SearchSelectDialog
                title="Select Caretaker"
                placeholder="Search caretaker..."
                searchFn={searchCaretakers}
                onSelect={(c: unknown) => {
                  const caretaker = c as { id: string };
                  setNewTicket({ ...newTicket, caretaker_id: caretaker.id });
                }}
                trigger={
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm"
                    disabled={!newTicket.property_id}
                  >
                    {newTicket.caretaker_id
                      ? "Caretaker selected"
                      : "Select caretaker"}
                  </Button>
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wo-title">Issue Title *</Label>
              <Input
                id="wo-title"
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                placeholder="e.g. Leaking faucet in kitchen"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wo-desc">Description</Label>
              <Textarea
                id="wo-desc"
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                placeholder="Provide more details about the issue..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="wo-category">Category</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(v) =>
                    setNewTicket({
                      ...newTicket,
                      category: v as WorkOrderCategory,
                    })
                  }
                >
                  <SelectTrigger id="wo-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="wo-priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) =>
                    setNewTicket({
                      ...newTicket,
                      priority: v as WorkOrderPriority,
                    })
                  }
                >
                  <SelectTrigger id="wo-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
