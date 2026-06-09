"use client";

import { Columns, LayoutGrid, List as ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "grid" | "board";

interface MaintenanceViewSwitcherProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function MaintenanceViewSwitcher({
  viewMode,
  setViewMode,
}: MaintenanceViewSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-muted p-1">
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
          viewMode === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
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
            : "text-muted-foreground hover:text-foreground"
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
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Columns className="h-4 w-4" />
        Board
      </button>
    </div>
  );
}
