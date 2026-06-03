import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 *
 * Clears the HTTP-only auth token and agency slug cookies, then returns 200.
 * The client is responsible for redirecting to /login afterwards.
 */
export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "emakao_auth_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  cookieStore.set({
    name: "active_agency_slug",
    value: "",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
