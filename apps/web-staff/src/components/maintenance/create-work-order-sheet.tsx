"use client";

import { useState } from "react";
import {
  AlignLeft,
  Building,
  Flag,
  Hash,
  Home,
  Loader2,
  Paperclip,
  Plus,
  Trash2,
  Type,
  Upload,
  User,
  X,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchSelectDialog,
  type SearchResult,
} from "@/components/shared/search-select-dialog";
import {
  useCreateWorkOrder,
  type WorkOrderCategory,
  type WorkOrderPriority,
} from "@/hooks/use-work-orders";
import { useProperties } from "@/hooks/use-properties";
import { useUnits } from "@/hooks/use-units";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface WorkOrderAttachment {
  name: string;
  url: string;
  key: string;
  mime: string;
  size_bytes: number;
}

interface CreateWorkOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string; // Optional: preset property if creating from property page
}

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

export function CreateWorkOrderSheet({
  open,
  onOpenChange,
  propertyId,
}: CreateWorkOrderSheetProps) {
  const { data: properties } = useProperties();
  const createMutation = useCreateWorkOrder();
  const { upload } = useUpload();

  const [form, setForm] = useState({
    property_id: propertyId || "",
    unit_id: "",
    caretaker_id: "",
    title: "",
    description: "",
    category: "general" as WorkOrderCategory,
    priority: "medium" as WorkOrderPriority,
  });

  const [attachments, setAttachments] = useState<WorkOrderAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: units } = useUnits(form.property_id || undefined);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await upload.mutateAsync({
        file,
        context: "work_order",
      });

      setAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          url: res.url,
          key: res.key,
          mime: res.content_type,
          size_bytes: res.size_bytes,
        },
      ]);
      toast.success("File uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (key: string) => {
    setAttachments((prev) => prev.filter((a) => a.key !== key));
  };

  const searchProperties = async (q: string): Promise<SearchResult[]> => {
    const res = await fetch(
      `/api/proxy/api/v1/properties?q=${encodeURIComponent(q)}&limit=10`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(
      (p: { id: string; name: string; address: string; city: string }) => ({
        id: p.id,
        title: p.name,
        subtitle: `${p.address}, ${p.city}`,
        data: p,
      }),
    );
  };

  const searchUnits = async (q: string): Promise<SearchResult[]> => {
    if (!form.property_id) return [];
    const res = await fetch(
      `/api/proxy/api/v1/properties/${form.property_id}/units?q=${encodeURIComponent(q)}&limit=10`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(
      (u: { id: string; unit_number: string; description?: string }) => ({
        id: u.id,
        title: `Unit ${u.unit_number}`,
        subtitle: u.description,
        data: u,
      }),
    );
  };

  const searchCaretakers = async (q: string): Promise<SearchResult[]> => {
    const res = await fetch(
      `/api/proxy/api/v1/caretakers?q=${encodeURIComponent(q)}&limit=10`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(
      (c: {
        id: string;
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
      }) => ({
        id: c.id,
        title: `${c.first_name} ${c.last_name}`,
        subtitle: c.email || c.phone,
        data: c,
      }),
    );
  };

  const handleCreate = async () => {
    if (!form.property_id || !form.title) {
      toast.error("Property and Title are required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        ...form,
        unit_id: form.unit_id || undefined,
        caretaker_id: form.caretaker_id || undefined,
        reporter_type: "staff",
        subtasks: [],
        attachments: attachments,
      } as Parameters<typeof createMutation.mutateAsync>[0]);
      toast.success("Work order created successfully");
      onOpenChange(false);
      setForm({
        property_id: propertyId || "",
        unit_id: "",
        caretaker_id: "",
        title: "",
        description: "",
        category: "general",
        priority: "medium",
      });
      setAttachments([]);
    } catch {
      toast.error("Failed to create work order");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 outline-none sm:max-w-[540px]"
      >
        {/* ── Top Bar ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-semibold">New Work Order</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-4"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2 px-4 font-semibold"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Task
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-6">
            {/* ── Title & Description ── */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  Task Title *
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Leaking faucet in kitchen"
                  className="h-10 rounded-md border-input font-medium focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <AlignLeft className="h-3 w-3" />
                  Description
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Provide more details about the issue..."
                  className="min-h-[100px] resize-none rounded-md border-input bg-muted/20 text-sm leading-relaxed focus-visible:ring-primary"
                />
              </div>
            </div>

            <Separator />

            {/* ── Property & Unit ── */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Building className="h-3 w-3" />
                    Property *
                  </Label>
                  <SearchSelectDialog
                    title="Select Property"
                    placeholder="Search property name..."
                    searchFn={searchProperties}
                    onSelect={(p: unknown) => {
                      const prop = p as { id: string };
                      setForm({
                        ...form,
                        property_id: prop.id,
                        unit_id: "",
                        caretaker_id: "",
                      });
                    }}
                    trigger={
                      <Button
                        variant="outline"
                        className="h-10 w-full justify-start rounded-md border-input px-3 font-medium hover:bg-muted/50"
                      >
                        <span className="truncate">
                          {form.property_id
                            ? properties?.find((p) => p.id === form.property_id)
                                ?.name || "Property Selected"
                            : "Select property"}
                        </span>
                      </Button>
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Home className="h-3 w-3" />
                    Unit (Optional)
                  </Label>
                  <SearchSelectDialog
                    title="Select Unit"
                    placeholder="Search unit number..."
                    searchFn={searchUnits}
                    onSelect={(u: unknown) => {
                      const unit = u as { id: string };
                      setForm({ ...form, unit_id: unit.id });
                    }}
                    trigger={
                      <Button
                        variant="outline"
                        className="h-10 w-full justify-start rounded-md border-input px-3 font-medium hover:bg-muted/50"
                        disabled={!form.property_id}
                      >
                        <span className="truncate">
                          {form.unit_id
                            ? units?.find((u) => u.id === form.unit_id)
                                ?.unit_number || "Unit Selected"
                            : form.property_id
                              ? "Select unit"
                              : "Select property first"}
                        </span>
                      </Button>
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3 w-3" />
                  Caretaker (Optional)
                </Label>
                <SearchSelectDialog
                  title="Select Caretaker"
                  placeholder="Search caretaker..."
                  searchFn={searchCaretakers}
                  onSelect={(c: unknown) => {
                    const caretaker = c as { id: string };
                    setForm({ ...form, caretaker_id: caretaker.id });
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      className="h-10 w-full justify-start rounded-md border-input px-3 font-medium hover:bg-muted/50"
                      disabled={!form.property_id}
                    >
                      <span className="truncate">
                        {form.caretaker_id
                          ? "Caretaker selected"
                          : "Select caretaker"}
                      </span>
                    </Button>
                  }
                />
              </div>
            </div>

            <Separator />

            {/* ── Category & Priority ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Type className="h-3 w-3" />
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as WorkOrderCategory })
                  }
                >
                  <SelectTrigger className="h-10 rounded-md border-input font-medium focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-input">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Flag className="h-3 w-3" />
                  Priority
                </Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm({ ...form, priority: v as WorkOrderPriority })
                  }
                >
                  <SelectTrigger className="h-10 rounded-md border-input font-medium focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-input">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* ── Attachments ── */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                Attachments
              </Label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <div
                    key={file.key}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 text-xs font-medium"
                  >
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(file.key)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 rounded-lg border-dashed"
                  disabled={isUploading}
                  onClick={() =>
                    document.getElementById("create-task-file-upload")?.click()
                  }
                >
                  {isUploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {isUploading ? "Uploading..." : "Add File"}
                  <input
                    id="create-task-file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Button>
              </div>
            </div>

            {/* ── Info Box ── */}
            <div className="flex gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold">Pro Tip</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  After creating the task, you can add subtasks and attachments
                  from the task details panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
