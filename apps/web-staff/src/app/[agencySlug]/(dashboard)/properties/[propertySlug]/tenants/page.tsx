"use client";

import { usePropertyRoute } from "../property-route-context";
import { useTenants } from "@/hooks/use-tenants";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKES } from "@emakao/shared";
import { Plus, Users, TrendingDown, DollarSign, Home } from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function PropertyTenantsPage() {
  const { propertyId, property } = usePropertyRoute();
  const { data: tenants, isLoading } = useTenants(propertyId);
  const router = useRouter();
  const { agencySlug, propertySlug } = useParams<{
    agencySlug: string;
    propertySlug: string;
  }>();

  if (!propertyId) return null;

  const totalRent = tenants?.reduce((sum, t) => sum + t.rent_amount_kes, 0) ?? 0;
  const totalBalance = tenants?.reduce((sum, t) => sum + t.outstanding_balance, 0) ?? 0;
  const activeCount = tenants?.filter((t) => t.status === "active").length ?? 0;

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground text-sm">
            Manage tenants and leases for{" "}
            <span className="font-medium">{property?.name || "this property"}</span>.
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/${agencySlug}/properties/${propertySlug}/tenants/new`)
          }
          className="rounded-xl shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {/* ── Stats strip ── */}
      {!isLoading && tenants && tenants.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-background p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Tenants</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </div>
          <div className="rounded-2xl border bg-background p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Rent</p>
              <p className="text-xl font-bold">{formatKES(totalRent)}</p>
            </div>
          </div>
          <div className="rounded-2xl border bg-background p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TrendingDown className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-xl font-bold">{formatKES(totalBalance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-2xl border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="pl-5">Resident</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-5">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !tenants || tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                      <Home className="size-7" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">No tenants yet</p>
                      <p className="text-sm mt-1">
                        Add a tenant to start tracking leases for this property.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-2 rounded-xl"
                      onClick={() =>
                        router.push(
                          `/${agencySlug}/properties/${propertySlug}/tenants/new`
                        )
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Tenant
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => {
                const fullyPaid = tenant.deposit_paid >= tenant.deposit_kes;
                const hasBalance = tenant.outstanding_balance > 0;
                return (
                  <TableRow key={tenant.agreement_id} className="group">
                    <TableCell className="pl-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm">{tenant.resident_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {tenant.resident_email || tenant.resident_phone || "No contact"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium">
                        Unit {tenant.unit_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">
                        {formatKES(tenant.rent_amount_kes)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">{formatKES(tenant.deposit_kes)}</span>
                        <span
                          className={
                            "text-xs " +
                            (fullyPaid
                              ? "text-emerald-600 font-medium"
                              : "text-muted-foreground")
                          }
                        >
                          {fullyPaid
                            ? "✓ Paid in full"
                            : `Paid: ${formatKES(tenant.deposit_paid)}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          hasBalance
                            ? "text-destructive font-semibold text-sm"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {formatKES(tenant.outstanding_balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tenant.status === "active" ? "default" : "secondary"
                        }
                        className="capitalize"
                      >
                        {tenant.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
