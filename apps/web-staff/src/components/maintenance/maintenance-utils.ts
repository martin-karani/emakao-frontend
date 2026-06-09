"use client";

import { format } from "date-fns";
import type { WorkOrder, WorkOrderStatus } from "@/hooks/use-work-orders";

export interface PersonChip {
  id: string;
  initials: string;
  name?: string;
}

export const ORDER_GROUPS = [
  {
    key: "open",
    label: "Not Started",
    dotClass: "bg-orange-400",
    statuses: ["open"],
  },
  {
    key: "inprogress",
    label: "In Progress",
    dotClass: "bg-blue-500",
    statuses: ["inprogress"],
  },
  {
    key: "done",
    label: "Done",
    dotClass: "bg-emerald-500",
    statuses: ["completed", "cancelled"],
  },
] as const;

export const STATUS_META: Record<
  WorkOrderStatus,
  { label: string; badgeClass: string }
> = {
  open: {
    label: "Not Started",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  inprogress: {
    label: "In Progress",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

export const PRIORITY_META = {
  low: {
    label: "Low",
    className: "text-slate-600 bg-slate-50 border-slate-200",
    iconClass: "text-slate-400",
  },
  medium: {
    label: "Medium",
    className: "text-amber-600 bg-amber-50 border-amber-200",
    iconClass: "text-amber-400",
  },
  high: {
    label: "High",
    className: "text-orange-600 bg-orange-50 border-orange-200",
    iconClass: "text-orange-400",
  },
  emergency: {
    label: "Emergency",
    className: "text-red-600 bg-red-50 border-red-200",
    iconClass: "text-red-400",
  },
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function buildPeople(
  order: WorkOrder,
  staffMap: Map<string, { email: string; role: string }>,
  caretakerMap: Map<string, { name: string }>,
): PersonChip[] {
  const people: PersonChip[] = [];
  if (order.assigned_to) {
    const staff = staffMap.get(order.assigned_to);
    people.push({
      id: order.assigned_to,
      initials: staff?.email ? getInitials(staff.email.split("@")[0]) : "ST",
      name: staff?.email ? staff.email.split("@")[0] : "Staff",
    });
  }
  if (order.assigned_caretaker_id) {
    const ct = caretakerMap.get(order.assigned_caretaker_id);
    people.push({
      id: order.assigned_caretaker_id,
      initials: ct?.name ? getInitials(ct.name) : "CT",
      name: ct?.name ?? "Caretaker",
    });
  }
  return people;
}

export function formatTimeline(order: WorkOrder) {
  if (order.status === "completed" && order.completed_at) {
    return `Done ${format(new Date(order.completed_at), "MMM d")}`;
  }
  if (order.due_date) {
    return `Due ${format(new Date(order.due_date), "MMM d")}`;
  }
  return `Created ${format(new Date(order.created_at), "MMM d")}`;
}

export function shortId(uuid: string) {
  return uuid.split("-")[0];
}
