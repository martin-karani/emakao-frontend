import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Root page — immediately redirects based on auth state.
 * Server Component so we can read the HTTP-only cookie without client JS.
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("emakao_auth_token");
  const agencySlug = cookieStore.get("active_agency_slug")?.value;

  if (token?.value && agencySlug) {
    redirect(`/${agencySlug}/dashboard`);
  } else {
    redirect("/login");
  }
}
