"use client";

import { useRouter } from "next/navigation";
import {
  CreditCard,
  Loader2,
  Building2,
  ArrowRight,
  Calculator,
  Clock,
  Droplets,
} from "lucide-react";
import { useAgencyBillingSummary } from "@/hooks/use-agency-billing";
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

export default function AgencyBillingPage() {
  const router = useRouter();
  const { data: summaries, isLoading } = useAgencyBillingSummary();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Agency Billing Overview
        </h1>
        <p className="text-muted-foreground">
          A summary of billing and utility configurations across all properties.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Rent Cycle</TableHead>
              <TableHead>Late Fees</TableHead>
              <TableHead>Utilities & Services</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries?.map((item) => (
              <TableRow key={item.property_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {item.property_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Due: {item.rent_due_day}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.currency_code}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {item.late_fee_summary}
                </TableCell>
                <TableCell className="text-sm max-w-[250px] truncate">
                  {item.utility_summary}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/properties/${item.property_id}?tab=billing`)
                    }
                  >
                    Manage
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {summaries?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No properties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col gap-2 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 font-semibold text-blue-700">
            <Clock className="h-4 w-4" />
            Centralized Cycles
          </div>
          <p className="text-xs text-blue-600 leading-relaxed">
            Rent due dates are now configured per property to allow for
            staggered billing cycles across your portfolio.
          </p>
        </Card>
        <Card className="p-4 flex flex-col gap-2 bg-green-500/5 border-green-500/20">
          <div className="flex items-center gap-2 font-semibold text-green-700">
            <Calculator className="h-4 w-4" />
            Custom Penalties
          </div>
          <p className="text-xs text-green-600 leading-relaxed">
            Each property can have its own late fee structure (flat or
            percentage) and custom grace periods.
          </p>
        </Card>
        <Card className="p-4 flex flex-col gap-2 bg-purple-500/5 border-purple-500/20">
          <div className="flex items-center gap-2 font-semibold text-purple-700">
            <Droplets className="h-4 w-4" />
            Utility Rates
          </div>
          <p className="text-xs text-purple-600 leading-relaxed">
            Water rates and fixed service charges (Garbage, Security) are
            managed at the property level for maximum flexibility.
          </p>
        </Card>
      </div>
    </div>
  );
}

// Simple Card component since we don't have it imported from UI
function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border shadow-sm ${className}`}>{children}</div>
  );
}
