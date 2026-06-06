"use client";

import {
  useAgreements,
  useTerminateAgreement,
  type Agreement,
} from "@/hooks/use-agreements";
import { formatKES } from "@emakao/shared";
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
import { FileSignature, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/hooks";

/** Map backend AgreementStatus values to badge variants */
function statusVariant(
  status: Agreement["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "terminated":
    case "expired":
      return "destructive";
    case "pendingsignature":
    case "pendingrenewal":
      return "outline";
    default:
      return "secondary";
  }
}

export default function LeasesPage() {
  const { workspaceMode, activePropertyId } = useWorkspace([]);
  const { data: agreements, isLoading } = useAgreements({
    property_id: workspaceMode === "property" ? activePropertyId : undefined,
  });
  const terminateMutation = useTerminateAgreement();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading agreements...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Lease Agreements
          </h2>
          <p className="text-muted-foreground">
            Manage active tenancies and lease cycles.
          </p>
        </div>
        <Button>
          <FileSignature className="w-4 h-4 mr-2" />
          Draft New Lease
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property / Unit</TableHead>
              <TableHead className="text-right">Rent Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agreements?.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell className="font-medium">
                  {agreement.resident_id}
                </TableCell>
                <TableCell>
                  {agreement.property_id}
                  <div className="text-xs text-muted-foreground">
                    Unit: {agreement.unit_id}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatKES(agreement.rent_amount_kes)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusVariant(agreement.status)}>
                    {agreement.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={
                          agreement.status === "terminated" ||
                          terminateMutation.isPending
                        }
                        onClick={() => terminateMutation.mutate(agreement.id)}
                      >
                        Terminate Lease
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {(!agreements || agreements.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No lease agreements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
