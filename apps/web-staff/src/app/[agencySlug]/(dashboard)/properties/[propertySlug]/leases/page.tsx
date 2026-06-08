// apps/web-staff/src/app/(dashboard)/properties/[id]/leases/page.tsx

"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProperties, useWorkspace } from "@/hooks";
import { ArrowRight } from "lucide-react";

export default function LeasesPage() {
  const { data: properties } = useProperties();
  const { buildAgencyUrl } = useWorkspace(properties ?? []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <CardTitle className="text-base">Active Leases</CardTitle>
        <Link
          href={buildAgencyUrl("/leases")}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
        >
          Manage leases <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Lease summary will appear here. Head to the{" "}
          <Link
            href={buildAgencyUrl("/leases")}
            className="text-primary underline"
          >
            Leases page
          </Link>{" "}
          to manage tenants, renewals and move-outs.
        </div>
      </CardContent>
    </Card>
  );
}
