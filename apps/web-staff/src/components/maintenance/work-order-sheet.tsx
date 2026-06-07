"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Wrench,
  Calendar,
  MapPin,
  User,
  Tag,
  AlertTriangle,
  CheckSquare,
  Square,
  Clock,
  Loader2,
  Hash,
  Home,
} from "lucide-react";
import { useUpdateWorkOrder, type WorkOrder, type WorkOrderStatus } from "@/hooks/use-work-orders";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/date-format";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
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

const STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string; badgeClass: string }
> = {
  open: {
    label: "Not Started",
    dotClass: "bg-orange-400",
    badgeClass:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  inprogress: {
    label: "In Progress",
    dotClass: "bg-indigo-400",
    badgeClass:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  },
  completed: {
    label: "Done",
    dotClass: "bg-emerald-400",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-rose-400",
    badgeClass:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
  },
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex items-center gap-2 w-32 shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}

function SubtaskItem({
  subtask,
  onToggle,
  disabled,
}: {
  subtask: Subtask;
  onToggle: (id: string, completed: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => onToggle(subtask.id, !subtask.is_completed)}
      disabled={disabled}
      className="flex items-start gap-3 w-full rounded-lg px-3 py-2.5 text-left hover:bg-muted/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      {subtask.is_completed ? (
        <CheckSquare className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
      ) : (
        <Square className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
      <span
        className={`text-sm leading-snug ${
          subtask.is_completed
            ? "line-through text-muted-foreground"
            : "text-foreground"
        }`}
      >
        {subtask.title}
      </span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface WorkOrderSheetProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkOrderSheet({
  workOrder,
  open,
  onOpenChange,
}: WorkOrderSheetProps) {
  const updateMutation = useUpdateWorkOrder();
  const [updatingSubtask, setUpdatingSubtask] = useState<string | null>(null);

  if (!workOrder) return null;

  const priorityCfg = PRIORITY_CONFIG[workOrder.priority] ?? PRIORITY_CONFIG.medium;
  const statusCfg = STATUS_CONFIG[workOrder.status] ?? STATUS_CONFIG.open;

  // subtasks may not exist yet on old data
  const subtasks: Subtask[] = (workOrder as unknown as { subtasks?: Subtask[] }).subtasks ?? [];
  const completedCount = subtasks.filter((s) => s.is_completed).length;

  const handleStatusChange = async (status: WorkOrderStatus) => {
    try {
      await updateMutation.mutateAsync({ id: workOrder.id, body: { status } });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    setUpdatingSubtask(subtaskId);
    const updated = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, is_completed: completed } : s
    );
    try {
      await updateMutation.mutateAsync({
        id: workOrder.id,
        body: { subtasks: updated } as Parameters<typeof updateMutation.mutateAsync>[0]["body"],
      });
    } catch {
      toast.error("Failed to update subtask");
    } finally {
      setUpdatingSubtask(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] overflow-y-auto flex flex-col gap-0 p-0"
      >
        {/* ── Header ── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {workOrder.code}
            </span>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={`text-[10px] h-5 ${priorityCfg.className}`}
              >
                {priorityCfg.label}
              </Badge>
            </div>
          </div>

          <SheetTitle className="text-base font-semibold leading-snug pr-8">
            {workOrder.title}
          </SheetTitle>

          {workOrder.description && (
            <SheetDescription className="text-sm text-muted-foreground leading-relaxed mt-1.5">
              {workOrder.description}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* ── Status control ── */}
        <div className="px-5 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium w-16 shrink-0">
              Status
            </span>
            <Select
              value={workOrder.status}
              onValueChange={(v) => handleStatusChange(v as WorkOrderStatus)}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger className="h-7 border text-xs w-auto min-w-[130px] gap-2 bg-background">
                <span className={`inline-block w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
                <SelectValue />
                {updateMutation.isPending && (
                  <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                )}
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2 text-xs">
                      <span className={`inline-block w-2 h-2 rounded-full ${cfg.dotClass}`} />
                      {cfg.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Meta info ── */}
        <div className="px-5 py-1 border-b divide-y divide-border/60">
          <MetaRow icon={User} label="Assigned">
            {workOrder.assigned_caretaker_id ? (
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback>
                    {getInitials(workOrder.assigned_caretaker_id)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Caretaker</span>
              </div>
            ) : (
              <span className="text-muted-foreground italic text-sm">Unassigned</span>
            )}
          </MetaRow>

          <MetaRow icon={Calendar} label="Created">
            <span className="text-sm">
              {formatShortDate(workOrder.created_at)}
            </span>
          </MetaRow>

          {workOrder.scheduled_date && (
            <MetaRow icon={Clock} label="Scheduled">
              <span className="text-sm">
                {formatShortDate(workOrder.scheduled_date)}
              </span>
            </MetaRow>
          )}

          <MetaRow icon={Tag} label="Category">
            <span className="text-sm capitalize">
              {workOrder.category.replace("_", " ")}
            </span>
          </MetaRow>

          <MetaRow icon={AlertTriangle} label="Priority">
            <Badge
              variant="outline"
              className={`text-[10px] h-5 ${priorityCfg.className}`}
            >
              {priorityCfg.label}
            </Badge>
          </MetaRow>

          <MetaRow icon={Home} label="Location">
            {workOrder.unit_id ? (
              <span className="text-sm font-medium">
                Unit {workOrder.unit_id.split("-")[0]}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Common Area</span>
            )}
          </MetaRow>

          {workOrder.reporter_type && (
            <MetaRow icon={Hash} label="Reporter">
              <span className="text-sm capitalize">{workOrder.reporter_type}</span>
            </MetaRow>
          )}
        </div>

        {/* ── Subtasks ── */}
        {subtasks.length > 0 && (
          <div className="px-5 py-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Subtasks</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {completedCount} / {subtasks.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-muted rounded-full mb-3">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: subtasks.length
                    ? `${(completedCount / subtasks.length) * 100}%`
                    : "0%",
                }}
              />
            </div>

            <div className="space-y-0.5">
              {subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onToggle={handleSubtaskToggle}
                  disabled={updatingSubtask === subtask.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Notes / description (full) ── */}
        {workOrder.description && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Details</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {workOrder.description}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
