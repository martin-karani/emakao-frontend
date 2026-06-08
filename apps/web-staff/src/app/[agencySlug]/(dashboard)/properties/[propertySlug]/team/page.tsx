// apps/web-staff/src/app/(dashboard)/properties/[id]/team/page.tsx

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePropertyRoute } from "../property-route-context";

export default function TeamPage() {
  const { agencySlug } = useParams<{ agencySlug: string }>();
  const { property, propertySlug } = usePropertyRoute();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const owners: { id: string; name?: string; email?: string }[] =
    (property as any)?.owners ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const caretakers: { id: string; name?: string; email?: string }[] =
    (property as any)?.caretakers ?? [];

  const renderList = (
    people: { id: string; name?: string; email?: string }[],
    emptyLabel: string
  ) =>
    people.length === 0 ? (
      <p className="text-sm text-muted-foreground">{emptyLabel}</p>
    ) : (
      <ul className="space-y-2">
        {people.map((p) => (
          <li key={p.id} className="flex items-center gap-3 text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
              {(p.name ?? p.email ?? "?")[0]}
            </span>
            <span>{p.name ?? p.email ?? p.id}</span>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <CardTitle className="text-base">Owners</CardTitle>
          <Link
            href={`/${agencySlug}/properties/${propertySlug}/settings`}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
          >
            Edit <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>{renderList(owners, "No owners assigned.")}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Caretakers / Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {renderList(caretakers, "No caretakers assigned.")}
        </CardContent>
      </Card>
    </div>
  );
}
