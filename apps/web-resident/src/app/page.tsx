"use client";

/**
 * Resident dashboard — fetches from Next.js API proxy, which reads the
 * http-only emakao_auth_token cookie and forwards it to the Axum backend.
 *
 * NOTE: This file must live at src/app/dashboard/page.tsx (or inside a
 * route group like src/app/(portal)/dashboard/page.tsx) — NOT at
 * src/dashboard/page.tsx, which is outside the App Router tree.
 */

import { useQuery } from "@tanstack/react-query";
import { formatKES } from "@emakao/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, CheckCircle2 } from "lucide-react";

interface ResidentOverview {
  first_name: string;
  property_name: string;
  unit_number: string;
  current_invoice?: {
    status: "PENDING" | "PAID" | "OVERDUE";
    amount_due: number | string;
  };
}

function useResidentOverview() {
  return useQuery<ResidentOverview>({
    queryKey: ["resident", "overview"],
    queryFn: async () => {
      const res = await fetch("/api/proxy/tenant/overview");
      if (!res.ok) throw new Error("Failed to load overview");
      return res.json() as Promise<ResidentOverview>;
    },
  });
}

export default function ResidentDashboard() {
  const { data, isLoading, error } = useResidentOverview();

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-slate-200 rounded-xl" />;
  }

  if (error || !data) {
    return (
      <div className="text-sm text-destructive">
        Failed to load your dashboard. Please refresh.
      </div>
    );
  }

  const currentInvoice = data.current_invoice;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome home, {data.first_name}
        </h1>
        <p className="text-muted-foreground mt-1">
          {data.property_name} — Unit {data.unit_number}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Rent Status Card */}
        <Card
          className={
            currentInvoice?.status === "OVERDUE" ? "border-red-200" : ""
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Balance
              {currentInvoice?.status === "PAID" && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {currentInvoice?.status === "OVERDUE" && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </CardTitle>
            <CardDescription>
              Rent for{" "}
              {new Date().toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {formatKES(currentInvoice?.amount_due ?? 0)}
            </div>
            {currentInvoice?.status === "PENDING" ? (
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Pay via M-PESA
              </Button>
            ) : (
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" /> Download Receipt
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your tenancy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              Log Maintenance Request
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              View Lease Agreement
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Update Contact Info
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
