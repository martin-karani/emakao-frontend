import { redirect } from "next/navigation";

export default async function AgencyRootPage({
  params,
}: {
  params: Promise<{ agencySlug: string }>;
}) {
  const { agencySlug } = await params;
  redirect(`/${agencySlug}/dashboard`);
}
