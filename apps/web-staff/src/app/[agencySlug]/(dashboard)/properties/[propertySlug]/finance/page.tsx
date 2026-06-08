// apps/web-staff/src/app/(dashboard)/properties/[id]/finance/page.tsx

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { usePropertyRoute } from "../property-route-context";

function ViewAllLink({ href, label = "Open" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
    >
      {label} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export default function FinancePage() {
  const { agencySlug } = useParams<{ agencySlug: string }>();
  const { propertySlug } = usePropertyRoute();
  const base = `/${agencySlug}/properties/${propertySlug}/finance`;

  const sections = [
    {
      label: "Rent Collection",
      href: base,
      desc: "Track monthly rent payments",
    },
    {
      label: "Expenses",
      href: `${base}/expenses`,
      desc: "Record property expenses",
    },
    {
      label: "Invoices",
      href: `${base}/invoices`,
      desc: "View & send invoices",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sections.map(({ label, href, desc }) => (
        <Card key={label} className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{desc}</p>
            <ViewAllLink href={href} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
