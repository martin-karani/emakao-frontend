import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginForm } from "./login-form";

/**
 * Server Component wrapper.
 *
 * Reads the HTTP-only auth cookie on the server before anything is sent to the
 * browser. If the user already has a valid session they are immediately
 * redirected to /dashboard — no flash, no client-side JS needed.
 *
 * The middleware handles the same redirect for most cases, but this acts as a
 * defence-in-depth layer (e.g. during SSR / static shell rendering).
 */
export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("emakao_auth_token");
  const agencySlug = cookieStore.get("active_agency_slug")?.value;

  if (token?.value && agencySlug) {
    redirect(`/${agencySlug}/dashboard`);
  }

  return <LoginForm />;
}
