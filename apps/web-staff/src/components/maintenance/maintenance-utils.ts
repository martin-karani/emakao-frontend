import { formatShortDate } from "@/lib/date-format";
import type { WorkOrder, WorkOrderStatus } from "@/hooks/use-work-orders";

export type PersonChip = {
  id: string;
  label: string;
  initials: string;
};

export function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function shortId(value?: string | null) {
  if (!value) return "Unknown";
  return value.slice(0, 6);
}

export function formatTimeline(order: WorkOrder) {
  const start = order.due_date ?? order.scheduled_at ?? order.created_at;
  const end = order.completed_at ?? null;

  if (end) {
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  }

  return formatShortDate(start);
}

export function buildPeople(
  order: WorkOrder,
  staffMap: Map<string, { email: string; role: string }>,
  caretakerMap: Map<string, { name: string }>,
): PersonChip[] {
  const people: PersonChip[] = [];

  if (order.assigned_to) {
    const staff = staffMap.get(order.assigned_to);
    const label = staff ? staff.email : `Staff ${shortId(order.assigned_to)}`;
    people.push({
      id: `staff-${order.assigned_to}`,
      label,
      initials: getInitials(label),
    });
  }

  if (order.assigned_caretaker_id) {
    const caretaker = caretakerMap.get(order.assigned_caretaker_id);
    const label =
      caretaker?.name ?? `Caretaker ${shortId(order.assigned_caretaker_id)}`;
    people.push({
      id: `caretaker-${order.assigned_caretaker_id}`,
      label,
      initials: getInitials(label),
    });
  }

  if (order.vendor_id) {
    const label = `Vendor ${shortId(order.vendor_id)}`;
    people.push({
      id: `vendor-${order.vendor_id}`,
      label,
      initials: "VN",
    });
  }

  return people;
}

export const STATUS_META: Record<
  WorkOrderStatus,
  {
    label: string;
    dotClass: string;
    badgeClass: string;
  }
> = {
  open: {
    label: "Not Started",
    dotClass: "bg-orange-500",
    badgeClass: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/50",
  },
  inprogress: {
    label: "In Progress",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50",
  },
  completed: {
    label: "Done",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-slate-500",
    badgeClass: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-900/50",
  },
};

export const ORDER_GROUPS: Array<{
  key: "open" | "inprogress" | "done";
  label: string;
  statuses: WorkOrderStatus[];
  badgeClass: string;
  dotClass: string;
}> = [
  {
    key: "open",
    label: "Not Started",
    statuses: ["open"],
    badgeClass: "bg-orange-500/10 text-orange-600 border-orange-200",
    dotClass: "bg-orange-500",
  },
  {
    key: "inprogress",
    label: "In Progress",
    statuses: ["inprogress"],
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200",
    dotClass: "bg-blue-500",
  },
  {
    key: "done",
    label: "Done",
    statuses: ["completed", "cancelled"],
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
];

export const PRIORITY_META: Record<
  WorkOrder["priority"],
  { label: string; className: string; iconClass: string }
> = {
  low: {
    label: "Lowest",
    className: "bg-slate-500/10 text-slate-600 border-slate-200",
    iconClass: "text-slate-500",
  },
  medium: {
    label: "Normal",
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
    iconClass: "text-blue-500",
  },
  high: {
    label: "Urgent",
    className: "bg-orange-500/10 text-orange-600 border-orange-200",
    iconClass: "text-orange-500",
  },
  emergency: {
    label: "Emergency",
    className: "bg-red-500/10 text-red-600 border-red-200",
    iconClass: "text-red-500",
  },
};
