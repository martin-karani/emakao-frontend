"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
  Tag,
  User,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/date-format";
import { WorkOrderSheet } from "@/components/maintenance/work-order-sheet";
import { cn } from "@/lib/utils";

// ── Constants (same as global maintenance page) ───────────────────────────────

const CATEGORIES = [
  "plumbing", "electrical", "structural", "hvac", "appliance",
  "painting", "cleaning", "security", "landscaping", "pest_control", "general",
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
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    headerClass: "text-orange-700 dark:text-orange-400",
  },
  {
    status: "inprogress",
    label: "In Progress",
    dotClass: "bg-indigo-400",
    badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    headerClass: "text-indigo-700 dark:text-indigo-400",
  },
  {
    status: "completed",
    label: "Done",
    dotClass: "bg-emerald-400",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    headerClass: "text-emerald-700 dark:text-emerald-400",
  },
  {
    status: "cancelled",
    label: "Cancelled",
    dotClass: "bg-rose-400",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
    headerClass: "text-rose-700 dark:text-rose-400",
  },
];

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: "Lowest", className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300" },
  medium: { label: "Normal", className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  high: { label: "Urgent", className: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300" },
  emergency: { label: "Emergency", className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300" },
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
      <td className="py-2.5 pl-4 pr-2 w-8">
        <div className="w-4 h-4 rounded border border-muted-foreground/30 group-hover:border-muted-foreground/60 transition-colors" />
      </td>
      <td className="py-2.5 pr-3 min-w-0 max-w-[260px]">
        <div className="text-sm font-medium truncate">{order.title}</div>
        <span className="text-[10px] font-mono text-muted-foreground">{order.code}</span>
      </td>
      <td className="py-2.5 pr-4 hidden md:table-cell">
        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
          {order.description || <span className="italic">No description</span>}
        </p>
      </td>
      <td className="py-2.5 pr-4 hidden lg:table-cell w-28">
        {order.assigned_caretaker_id ? (
          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <User className="w-3 h-3 text-indigo-600 dark:text-indigo-300" />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        )}
      </td>
      <td className="py-2.5 pr-4 hidden xl:table-cell w-28">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="w-3 h-3" />
          <span className="capitalize">{order.category.replace("_", " ")}</span>
        </div>
      </td>
      <td className="py-2.5 pr-4 hidden lg:table-cell w-32">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {formatShortDate(order.created_at)}
        </div>
      </td>
      <td className="py-2.5 pr-4 w-24">
        <Badge variant="outline" className={cn("text-[10px] h-5 font-medium", priority.className)}>
          {priority.label}
        </Badge>
      </td>
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
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
        <span className={cn("flex items-center gap-2 text-sm font-semibold", group.headerClass)}>
          <span className={cn("w-2.5 h-2.5 rounded-full", group.dotClass)} />
          {group.label}
        </span>
        <Badge
          variant="outline"
          className={cn("ml-1 text-[10px] h-5 font-semibold tabular-nums min-w-[22px] justify-center", group.badgeClass)}
        >
          {orders.length}
        </Badge>
      </button>

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
                  <th className="py-2 pr-3 text-left text-xs font-medium text-muted-foreground">Task Name</th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Description</th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell w-28">Assignee</th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell w-28">Category</th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell w-32">Date</th>
                  <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground w-24">Priority</th>
                  <th className="py-2 pr-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <WorkOrderRow key={order.id} order={order} onClick={() => onSelect(order)} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PropertyMaintenancePage() {
  const { id: propertyId } = useParams<{ id: string }>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: properties } = useProperties();
  const property = properties?.find((p) => p.id === propertyId);

  const { data: tickets = [], isLoading } = useWorkOrders({
    property_id: propertyId,
  });

  const searchUnits = async (q: string): Promise<SearchResult[]> => {
    const res = await fetch(
      `/api/proxy/api/v1/properties/${propertyId}/units?q=${encodeURIComponent(q)}&limit=10`
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
      `/api/proxy/api/v1/caretakers?q=${encodeURIComponent(q)}&limit=10`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id: string;
      first_name: string;
      last_name: string;
      email?: string;
    }>();
    return data.map((c) => ({
      id: c.id,
      title: `${c.first_name} ${c.last_name}`,
      subtitle: c.email,
      data: c,
    }));
  };

  const createMutation = useCreateWorkOrder();

  const [newTicket, setNewTicket] = useState({
    unit_id: "",
    caretaker_id: "",
    title: "",
    description: "",
    category: "general" as WorkOrderCategory,
    priority: "medium" as WorkOrderPriority,
  });

  const { data: units } = useUnits(propertyId);

  const handleCreate = async () => {
    if (!newTicket.title) {
      toast.error("Title is required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        property_id: propertyId,
        unit_id: newTicket.unit_id || undefined,
        caretaker_id: newTicket.caretaker_id || undefined,
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        reporter_type: "staff",
      } as Parameters<typeof createMutation.mutateAsync>[0]);
      toast.success("Work order created");
      setIsCreateOpen(false);
      setNewTicket({
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

  const grouped = STATUS_GROUPS.map((g) => ({
    ...g,
    orders: tickets.filter((t) => t.status === g.status),
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {tickets.length} work order{tickets.length !== 1 ? "s" : ""} for this property
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/20 text-center">
          <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-3" />
          <h3 className="text-base font-semibold">All clear!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No maintenance requests for this property.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {grouped.map((group) => (
            <StatusGroup
              key={group.status}
              group={group}
              orders={group.orders}
              onSelect={(o) => { setSelectedOrder(o); setSheetOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Slide-over */}
      <WorkOrderSheet
        workOrder={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Maintenance Issue</DialogTitle>
            <DialogDescription>
              {property?.name
                ? `Create a new work order for ${property.name}.`
                : "Create a new work order for this property."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
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
                    <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                      {newTicket.unit_id
                        ? (units?.find((u) => u.id === newTicket.unit_id)?.unit_number ?? "Unit Selected")
                        : "Select unit"}
                    </Button>
                  }
                />
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
                    <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                      {newTicket.caretaker_id ? "Caretaker selected" : "Select caretaker"}
                    </Button>
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pm-title">Issue Title *</Label>
              <Input
                id="pm-title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                placeholder="e.g. Leaking faucet in kitchen"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pm-desc">Description</Label>
              <Textarea
                id="pm-desc"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Provide more details about the issue..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pm-category">Category</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(v) => setNewTicket({ ...newTicket, category: v as WorkOrderCategory })}
                >
                  <SelectTrigger id="pm-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pm-priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) => setNewTicket({ ...newTicket, priority: v as WorkOrderPriority })}
                >
                  <SelectTrigger id="pm-priority"><SelectValue /></SelectTrigger>
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
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
