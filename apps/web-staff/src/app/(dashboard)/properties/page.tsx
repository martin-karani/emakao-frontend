// apps/web-staff/src/app/(dashboard)/properties/page.tsx
//
// Properties portfolio list.
// Uses Button render prop (not asChild) matching the base-ui button API.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProperties, useDeleteProperty } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Edit,
  Building2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "@/hooks";
import type { Property } from "@emakao/api-types";

interface UpdatedProperty extends Property {
  maintenance: {
    work_order_prefix: string;
    work_order_seq: number;
  };
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  multifamily: "Multifamily",
  commercial: "Commercial",
  community: "Community",
  student: "Student",
  affordable_housing: "Affordable",
  affordable: "Affordable",
};

function getWorkOrderPrefix(property: unknown) {
  return (property as UpdatedProperty)?.maintenance?.work_order_prefix;
}

export default function PropertiesPage() {
  const router = useRouter();
  const { workspaceMode, activeProperty } = useWorkspace([]);
  const { data: properties, isLoading } = useProperties();
  const deleteMutation = useDeleteProperty();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading properties…
      </div>
    );
  }

  // ── Property-workspace mode ────────────────────────────────────────────────
  if (workspaceMode === "property" && activeProperty) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {activeProperty.name}
            </h2>
            <p className="text-muted-foreground">
              Property Profile &amp; Details
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/properties/${activeProperty.id}`} />}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-muted-foreground">Address:</div>
                <div>{activeProperty.address}</div>
                <div className="text-muted-foreground">City:</div>
                <div>{activeProperty.city}</div>
                <div className="text-muted-foreground">Type:</div>
                <div>
                  <Badge variant="secondary">
                    {PROPERTY_TYPE_LABELS[activeProperty.property_type] ??
                      activeProperty.property_type}
                  </Badge>
                </div>
                <div className="text-muted-foreground">Work Order Prefix:</div>
                <div>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {getWorkOrderPrefix(activeProperty) ?? "Auto-generated"}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                {JSON.stringify(activeProperty.config, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Agency portfolio view ──────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Portfolio
          </h2>
          <p className="text-muted-foreground">
            Manage your agency&apos;s real estate portfolio.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/properties/new" />}>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties?.map((property) => (
              <TableRow
                key={property.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => router.push(`/properties/${property.id}`)}
              >
                <TableCell className="font-medium">{property.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {[property.address, property.city].filter(Boolean).join(", ")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {PROPERTY_TYPE_LABELS[property.property_type] ??
                      property.property_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      nativeButton={false}
                      render={<Link href={`/properties/${property.id}`} />}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete "${property.name}"? All units will also be removed.`,
                          )
                        ) {
                          deleteMutation.mutate(property.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {(!properties || properties.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="h-36 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Building2 className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No properties yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href="/properties/new" />}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first property
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
