// apps/web-staff/src/app/(dashboard)/properties/page.tsx
//
// Agency mode    → portfolio table (unchanged)
// Property mode  → redirect to /properties/[id] hub

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProperties, useDeleteProperty } from "@/hooks/use-properties";
import { useWorkspace } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Edit,
  Building2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { PropertySummary } from "@emakao/api-types";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  multifamily: "Multifamily",
  commercial: "Commercial",
  community: "Community Assoc.",
  student: "Student Housing",
  affordable_housing: "Affordable Housing",
  affordable: "Affordable Housing",
};

export default function PropertiesPage() {
  const router = useRouter();
  const { data: properties, isLoading } = useProperties();
  const { workspaceMode, activeProperty, buildWorkspaceUrl } = useWorkspace(
    properties ?? []
  );
  const deleteMutation = useDeleteProperty();

  // ── Property-workspace mode → forward to the property detail hub ───────────
  useEffect(() => {
    if (!isLoading && workspaceMode === "property" && activeProperty) {
      // Preserve the `?w=` param so workspace context is not lost.
      router.replace(buildWorkspaceUrl(`/properties/${activeProperty.id}`));
    }
  }, [isLoading, workspaceMode, activeProperty, router, buildWorkspaceUrl]);

  // Show a spinner while loading or while the redirect is pending.
  if (isLoading || (workspaceMode === "property" && activeProperty)) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading properties…
      </div>
    );
  }

  // ── Agency portfolio view ─────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {properties?.length ?? 0} propert
            {(properties?.length ?? 0) === 1 ? "y" : "ies"} in your portfolio
          </p>
        </div>
        <Button size="sm" render={<Link href="/properties/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Table */}
      {!properties?.length ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          <Building2 className="mx-auto mb-3 h-8 w-8 opacity-30" />
          No properties yet.{" "}
          <Link href="/properties/new" className="text-primary underline">
            Add your first property
          </Link>
          .
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden sm:table-cell">Units</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((p: PropertySummary) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {PROPERTY_TYPE_LABELS[p.property_type] ?? p.property_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {p.city}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {/* unit_count not always on summary */}—
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Open details"
                        render={<Link href={`/properties/${p.id}`} />}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Edit property"
                        render={
                          <Link href={`/properties/${p.id}/settings`} />
                        }
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        title="Delete property"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              `Delete "${p.name}"? This cannot be undone.`
                            )
                          ) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
