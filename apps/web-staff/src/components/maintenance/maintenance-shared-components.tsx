"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_META } from "./maintenance-utils";
import type { PersonChip } from "./maintenance-utils";
import type { WorkOrderStatus } from "@/hooks/use-work-orders";

export function PeopleStack({ people }: { people: PersonChip[] }) {
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

export function StatusSelect({
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
