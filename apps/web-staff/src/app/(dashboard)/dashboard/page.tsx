"use client";

import { useQuery } from "@tanstack/react-query";
import { useProperties, useWorkspace } from "@/hooks";
import { formatKES } from "@emakao/shared";
import { formatLongDate, formatMonthYear } from "@/lib/date-format";
import {
  Building2,
  CreditCard,
  Users,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types matching Rust backend DashboardSummary ──────────────────────────────

interface PortfolioStats {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  /** "0.0" – "100.0" as decimal string */
  occupancy_rate_pct: string;
  total_active_leases: number;
  total_open_work_orders: number;
}

interface PropertyOccupancySummary {
  property_id: string;
  property_name: string;
  city: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate_pct: string;
  open_work_orders: number;
  rent_collected_this_month_kes: string;
}

interface ExpiringLease {
  agreement_id: string;
  unit_number: string;
  property_name: string;
  resident_name: string;
  end_date: string;
  days_until_expiry: number;
  rent_amount_kes: string;
}

interface MaintenanceSummary {
  work_order_id: string;
  code: string;
  title: string;
  priority: "low" | "medium" | "high" | "emergency";
  status: string;
  property_name: string;
  unit_number?: string | null;
  days_open: number;
}

interface RentCollectionSummary {
  period_start: string;
  total_charged_kes: string;
  total_collected_kes: string;
  outstanding_kes: string;
  overdue_count: number;
  collection_rate_pct: string;
}

interface DashboardSummary {
  generated_at: string;
  portfolio: PortfolioStats;
  properties: PropertyOccupancySummary[];
  expiring_leases: ExpiringLease[];
  pending_maintenance: MaintenanceSummary[];
  rent_collection: RentCollectionSummary;
}

// ── Data fetching ─────────────────────────────────────────────────────────────

function useDashboard() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/proxy/api/v1/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json() as Promise<DashboardSummary>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const PRIORITY_STYLES: Record<MaintenanceSummary["priority"], string> = {
  emergency: "text-red-700 bg-red-50 border-red-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  low: "text-blue-700 bg-blue-50 border-blue-200",
};

function PropertyWorkspaceView({
  propertyName,
  generatedAt,
  summary,
  expiringLeases,
  pendingMaintenance,
}: {
  propertyName: string;
  generatedAt: string;
  summary?: PropertyOccupancySummary;
  expiringLeases: ExpiringLease[];
  pendingMaintenance: MaintenanceSummary[];
}) {
  if (!summary) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{propertyName}</h2>
          <p className="text-sm text-muted-foreground">
            {formatLongDate(generatedAt)}
          </p>
        </div>
        <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground text-sm">
          No occupancy data available for this property yet.
        </div>
      </div>
    );
  }

  const occupancyPct = parseFloat(summary.occupancy_rate_pct ?? "0");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {summary.property_name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {summary.city} · {formatLongDate(generatedAt)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Units"
          value={summary.total_units}
          description="Units in this property"
          icon={Building2}
        />
        <StatCard
          title="Occupied Units"
          value={summary.occupied_units}
          description={`${occupancyPct.toFixed(1)}% occupancy`}
          icon={Users}
        />
        <StatCard
          title="Vacant Units"
          value={summary.vacant_units}
          description="Available or unoccupied"
          icon={AlertTriangle}
        />
        <StatCard
          title="Open Work Orders"
          value={summary.open_work_orders}
          description={
            summary.open_work_orders === 0
              ? "No pending issues"
              : "Needs follow-up"
          }
          icon={Wrench}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Property Performance
            </CardTitle>
            <CardDescription>
              Current occupancy and rent collection for this property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Occupancy</span>
              <span className="font-medium">{occupancyPct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(occupancyPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Occupied</span>
              <span className="font-medium">{summary.occupied_units}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vacant</span>
              <span className="font-medium">{summary.vacant_units}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-sm">
              <span className="font-medium">Rent collected</span>
              <span className="font-semibold">
                {formatKES(summary.rent_collected_this_month_kes)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expiring Leases
            </CardTitle>
            <CardDescription>
              Leases for this property ending in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expiringLeases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No leases are expiring soon for this property.
              </p>
            ) : (
              <div className="space-y-3">
                {expiringLeases.slice(0, 6).map((lease) => (
                  <div
                    key={lease.agreement_id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {lease.resident_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unit {lease.unit_number}
                      </p>
                    </div>
                    <Badge
                      variant={
                        lease.days_until_expiry <= 7 ? "destructive" : "outline"
                      }
                    >
                      {lease.days_until_expiry}d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance Queue
          </CardTitle>
          <CardDescription>
            Work orders currently open for this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingMaintenance.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open work orders for this property.
            </p>
          ) : (
            <div className="divide-y">
              {pendingMaintenance.slice(0, 8).map((wo) => (
                <div
                  key={wo.work_order_id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{wo.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {wo.unit_number
                        ? `Unit ${wo.unit_number}`
                        : "Property-level"}{" "}
                      · {wo.days_open}d open
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`flex-shrink-0 ${PRIORITY_STYLES[wo.priority]}`}
                  >
                    {wo.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const { data: properties = [] } = useProperties({ limit: 100 });
  const { isPropertyWorkspace, activeProperty } = useWorkspace(properties);

  if (isLoading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        Failed to load dashboard. Please refresh the page.
      </div>
    );
  }

  const {
    portfolio,
    rent_collection,
    expiring_leases,
    pending_maintenance,
    properties: propertySummaries,
  } = data;

  const occupancyPct = parseFloat(portfolio.occupancy_rate_pct ?? "0");
  const collectionPct = parseFloat(rent_collection.collection_rate_pct ?? "0");
  const hasOutstanding = parseFloat(rent_collection.outstanding_kes) > 0;

  const activePropertySummary = activeProperty
    ? propertySummaries.find(
        (property) =>
          property.property_id === activeProperty.id ||
          property.property_name === activeProperty.name,
      )
    : undefined;

  const filteredLeases = activeProperty
    ? expiring_leases.filter(
        (lease) => lease.property_name === activeProperty.name,
      )
    : expiring_leases;

  const filteredMaintenance = activeProperty
    ? pending_maintenance.filter(
        (workOrder) => workOrder.property_name === activeProperty.name,
      )
    : pending_maintenance;

  if (isPropertyWorkspace && activeProperty) {
    return (
      <PropertyWorkspaceView
        propertyName={activeProperty.name}
        generatedAt={data.generated_at}
        summary={activePropertySummary}
        expiringLeases={filteredLeases}
        pendingMaintenance={filteredMaintenance}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Portfolio Overview
        </h2>
        <p className="text-muted-foreground text-sm">
          {formatLongDate(data.generated_at)}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Properties"
          value={portfolio.total_properties}
          description={`${portfolio.total_units} total units`}
          icon={Building2}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyPct.toFixed(1)}%`}
          description={`${portfolio.occupied_units} of ${portfolio.total_units} units occupied`}
          icon={Users}
        />
        <StatCard
          title="Rent Collected"
          value={formatKES(rent_collection.total_collected_kes, {
            compact: true,
          })}
          description={`${collectionPct.toFixed(1)}% collection rate this month`}
          icon={CreditCard}
        />
        <StatCard
          title="Open Work Orders"
          value={portfolio.total_open_work_orders}
          description={
            portfolio.total_open_work_orders === 0
              ? "All resolved ✓"
              : `${pending_maintenance.length} shown below`
          }
          icon={Wrench}
        />
      </div>

      {/* ── Rent Collection + Expiring Leases ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rent Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rent Collection
            </CardTitle>
            <CardDescription>
              {formatMonthYear(`${rent_collection.period_start}T00:00:00`)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">
                Total charged
              </span>
              <span className="font-medium">
                {formatKES(rent_collection.total_charged_kes)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Collected</span>
              <span className="font-medium text-green-600">
                {formatKES(rent_collection.total_collected_kes)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t">
              <span className="text-sm font-medium">Outstanding</span>
              <span
                className={
                  hasOutstanding
                    ? "font-semibold text-destructive"
                    : "font-semibold text-green-600"
                }
              >
                {formatKES(rent_collection.outstanding_kes)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1 pt-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(collectionPct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {collectionPct.toFixed(1)}% of rent collected
              </p>
            </div>

            {rent_collection.overdue_count > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {rent_collection.overdue_count}{" "}
                {rent_collection.overdue_count === 1
                  ? "tenant has"
                  : "tenants have"}{" "}
                overdue payments
              </div>
            )}

            {!hasOutstanding && rent_collection.overdue_count === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                All rent payments are settled this month.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Leases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expiring Leases
            </CardTitle>
            <CardDescription>Leases ending in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {expiring_leases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">All clear</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No leases expiring in the next 30 days.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiring_leases.slice(0, 6).map((lease) => (
                  <div
                    key={lease.agreement_id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {lease.resident_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lease.property_name} — Unit {lease.unit_number}
                      </p>
                    </div>
                    <Badge
                      variant={
                        lease.days_until_expiry <= 7
                          ? "destructive"
                          : lease.days_until_expiry <= 14
                            ? "outline"
                            : "secondary"
                      }
                      className="flex-shrink-0"
                    >
                      {lease.days_until_expiry}d
                    </Badge>
                  </div>
                ))}
                {expiring_leases.length > 6 && (
                  <p className="text-xs text-muted-foreground pt-1">
                    +{expiring_leases.length - 6} more expiring soon — see{" "}
                    <a
                      href="/leases"
                      className="underline hover:text-foreground"
                    >
                      Leases
                    </a>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Per-property breakdown ── */}
      {propertySummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>
              Occupancy and rent collection per property this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {propertySummaries.map((prop) => {
                const rate = parseFloat(prop.occupancy_rate_pct);
                return (
                  <div
                    key={prop.property_id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {prop.property_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {prop.city} · {prop.total_units} units
                      </p>
                    </div>

                    {/* Mini occupancy bar */}
                    <div className="hidden sm:flex flex-col items-end gap-1 w-24">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {rate.toFixed(0)}% full
                      </span>
                    </div>

                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">
                        {formatKES(prop.rent_collected_this_month_kes, {
                          compact: true,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">collected</p>
                    </div>

                    {prop.open_work_orders > 0 ? (
                      <Badge
                        variant="outline"
                        className="text-amber-700 border-amber-200 flex-shrink-0"
                      >
                        {prop.open_work_orders} WO
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex-shrink-0 text-green-700 bg-green-50"
                      >
                        ✓
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Pending Maintenance ── */}
      {pending_maintenance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Pending Maintenance
            </CardTitle>
            <CardDescription>
              Work orders currently open for this property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {pending_maintenance.slice(0, 8).map((wo) => (
                <div
                  key={wo.work_order_id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{wo.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {wo.property_name}
                      {wo.unit_number ? ` — Unit ${wo.unit_number}` : ""}
                      {" · "}
                      <span
                        className={
                          wo.days_open > 7 ? "text-amber-600 font-medium" : ""
                        }
                      >
                        {wo.days_open}d open
                      </span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`flex-shrink-0 ${PRIORITY_STYLES[wo.priority]}`}
                  >
                    {wo.priority}
                  </Badge>
                </div>
              ))}
              {pending_maintenance.length > 8 && (
                <p className="text-xs text-muted-foreground pt-3">
                  +{pending_maintenance.length - 8} more — see{" "}
                  <a
                    href="/maintenance"
                    className="underline hover:text-foreground"
                  >
                    Maintenance
                  </a>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
