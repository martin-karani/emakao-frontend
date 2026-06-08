import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agencySlug: string }>;
}) {
  const { agencySlug } = await params;
  const cookieStore = await cookies();
  const activeSlug = cookieStore.get("active_agency_slug")?.value;

  if (!activeSlug) redirect("/login");
  if (activeSlug !== agencySlug) redirect(`/${activeSlug}/dashboard`);

  return <DashboardShell>{children}</DashboardShell>;
}
