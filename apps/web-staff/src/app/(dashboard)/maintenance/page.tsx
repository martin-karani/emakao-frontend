"use client";

import { useState, useEffect } from "react";
import {
  useWorkOrders,
  useCreateWorkOrder,
  useUpdateWorkOrder,
  type WorkOrderStatus,
  type WorkOrderPriority,
  type WorkOrderCategory,
} from "@/hooks/use-work-orders";
import { useProperties, useUpdateProperty } from "@/hooks/use-properties";
import { useUnits } from "@/hooks/use-units";
import { useCaretakers } from "@/hooks/use-caretakers";
import { useAuth } from "@/hooks/use-auth";
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
  DialogTrigger,
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
  Wrench,
  Clock,
  CheckCircle,
  Plus,
  Loader2,
  AlertCircle,
  Filter,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/date-format";

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  emergency: "bg-red-100 text-red-800 border-red-200 font-bold",
};

const statusColors: Record<string, string> = {
  open: "bg-gray-100 text-gray-800",
  inprogress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

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

export default function MaintenancePage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<{
    property_id?: string;
    status?: WorkOrderStatus;
  }>({});

  const { data: properties } = useProperties();
  const { data: tickets, isLoading } = useWorkOrders(filters);

  const selectedProperty = filters.property_id
    ? properties?.find((p) => p.id === filters.property_id)
    : null;

  const [prefix, setPrefix] = useState("");

  const updateProperty = useUpdateProperty();

  const handleUpdatePrefix = async () => {
    if (!selectedProperty || !prefix) return;
    try {
      await updateProperty.mutateAsync({
        id: selectedProperty.id,
        dto: { work_order_prefix: prefix.toUpperCase() },
      });
      toast.success("Maintenance prefix updated");
      setIsSettingsOpen(false);
    } catch (err) {
      toast.error("Failed to update prefix");
    }
  };

  const isAgentManager =
    user?.role === "agent_manager" || user?.role === "admin";

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
  const updateMutation = useUpdateWorkOrder();

  // Form state
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
  const { data: caretakers } = useCaretakers(
    newTicket.property_id || undefined,
  );

  const handleCreate = async () => {
    if (!newTicket.property_id || !newTicket.title) {
      toast.error("Property and Title are required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...newTicket,
        unit_id: newTicket.unit_id || undefined,
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
    } catch (error) {
      toast.error("Failed to create work order");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            Maintenance & Work Orders
          </h1>
          <p className="text-muted-foreground">
            Track, assign, and resolve property maintenance requests.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Issue
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-card border rounded-md px-3 py-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium border-r pr-2 mr-1">
            Filters
          </span>
          <SearchSelectDialog
            title="Filter by Property"
            placeholder="Search property name..."
            searchFn={searchProperties}
            onSelect={(p: unknown) => {
              const prop = p as { id: string };
              setFilters({
                ...filters,
                property_id: prop.id,
              });
            }}
            trigger={
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                {filters.property_id
                  ? properties?.find((p) => p.id === filters.property_id)
                      ?.name || "Selected Property"
                  : "All Properties"}
                <Plus className="ml-1 h-3 w-3" />
              </Button>
            }
          />
          {filters.property_id && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  setFilters({ ...filters, property_id: undefined })
                }
              >
                <Plus className="h-3 w-3 rotate-45" />
              </Button>

              {isAgentManager && (
                <Dialog
                  open={isSettingsOpen}
                  onOpenChange={(open) => {
                    setIsSettingsOpen(open);
                    if (open && selectedProperty) {
                      setPrefix(selectedProperty.work_order_prefix);
                    }
                  }}
                >
                  <DialogTrigger
                    render={
                      <Button variant="ghost" size="icon-xs">
                        <Settings2 className="h-3.3 w-3.3 text-muted-foreground" />
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Maintenance Settings</DialogTitle>
                      <DialogDescription>
                        Configure maintenance settings for{" "}
                        {selectedProperty?.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="prefix">Work Order Prefix</Label>
                        <Input
                          id="prefix"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                          placeholder="e.g. AP"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          This prefix is used for all work orders in this
                          property (e.g. {prefix}-1001).
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsSettingsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdatePrefix}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
          <Select
            value={filters.status || "all"}
            onValueChange={(v) =>
              setFilters({
                ...filters,
                status: v === "all" ? undefined : (v as WorkOrderStatus),
              })
            }
          >
            <SelectTrigger className="h-7 border-none bg-transparent focus:ring-0 w-[120px] text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets?.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 space-y-4 hover:border-primary/20 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={priorityColors[ticket.priority]}
                  >
                    {ticket.priority.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {ticket.code}
                  </span>
                </div>
                <h3 className="font-semibold leading-none tracking-tight pt-1">
                  {ticket.title}
                </h3>
              </div>
              <Badge
                className={statusColors[ticket.status.replace("_", "")] || ""}
              >
                {ticket.status.replace("_", " ")}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {ticket.description || "No description provided."}
            </p>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatShortDate(ticket.created_at)}
              </div>
              <div className="capitalize">{ticket.category}</div>
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <div className="text-xs">
                {ticket.unit_id ? (
                  <span className="font-medium">
                    Unit {ticket.unit_id.split("-")[0]}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">
                    Common Area
                  </span>
                )}
              </div>

              <Select
                defaultValue={ticket.status}
                onValueChange={(val) => {
                  updateMutation.mutate({
                    id: ticket.id,
                    body: { status: val as WorkOrderStatus },
                  });
                }}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="w-[120px] h-8 text-[10px]">
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
        ))}

        {(!tickets || tickets.length === 0) && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">
              Everything&apos;s in order
            </h3>
            <p className="text-muted-foreground">
              No active maintenance requests match your filters.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Log Maintenance Issue</DialogTitle>
            <DialogDescription>
              Create a new work order to track a repair or service request.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="property">Property</Label>
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
                      className="w-full justify-start text-left font-normal"
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
                <Label htmlFor="unit">Unit (Optional)</Label>
                <SearchSelectDialog
                  title="Select Unit"
                  placeholder="Search unit number..."
                  searchFn={searchUnits}
                  onSelect={(u: unknown) => {
                    const unit = u as { id: string };
                    setNewTicket({ ...newTicket, unit_id: unit.id });
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="caretaker">Caretaker (Optional)</Label>
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
                      className="w-full justify-start text-left font-normal"
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
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                placeholder="e.g. Leaking faucet in kitchen"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
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
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(v) =>
                    setNewTicket({
                      ...newTicket,
                      category: v as WorkOrderCategory,
                    })
                  }
                >
                  <SelectTrigger id="category">
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
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) =>
                    setNewTicket({
                      ...newTicket,
                      priority: v as WorkOrderPriority,
                    })
                  }
                >
                  <SelectTrigger id="priority">
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
