// apps/web-staff/src/app/(dashboard)/properties/[id]/finance/page.tsx

"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useProperties, useWorkspace } from "@/hooks";

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
  const { data: properties } = useProperties();
  const { buildWorkspaceUrl } = useWorkspace(properties ?? []);

  const sections = [
    {
      label: "Rent Collection",
      href: buildWorkspaceUrl("/finance"),
      desc: "Track monthly rent payments",
    },
    {
      label: "Expenses",
      href: buildWorkspaceUrl("/finance/expenses"),
      desc: "Record property expenses",
    },
    {
      label: "Invoices",
      href: buildWorkspaceUrl("/finance/invoices"),
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
