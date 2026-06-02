import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * POST /api/auth/login
 *
 * Forwards StaffLoginDto to the Axum backend:
 *   POST /api/v1/auth/login
 *   Body: { agency_slug, contact, password }
 *
 * On success the backend returns LoginResponse:
 *   { access_token, token_type, expires_in, agency_id, agency_name,
 *     agency_slug, portal, must_change_password }
 *
 * We set two cookies:
 *   emakao_auth_token   — HTTP-only, the JWT
 *   active_agency_slug  — readable by client JS (used in the proxy header)
 *
 * must_change_password is forwarded to the client so it can redirect the
 * user to /change-password immediately after the cookie is set.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── 1. Forward credentials to the Axum backend ────────────────────────────
    const axumRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agency_slug: body.agency_slug, // required: identifies the tenant
        contact: body.contact, // email OR Kenyan phone (07xx / +2547xx)
        password: body.password,
      }),
    });

    if (!axumRes.ok) {
      const errorData = await axumRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message ?? "Invalid credentials" },
        { status: axumRes.status }
      );
    }

    // ── 2. Parse LoginResponse ────────────────────────────────────────────────
    const data = (await axumRes.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      agency_id: string;
      agency_name: string;
      agency_slug: string;
      portal: string;
      must_change_password: boolean;
    };

    // ── 3. Set HTTP-only auth cookie ──────────────────────────────────────────
    const cookieStore = await cookies();

    cookieStore.set({
      name: "emakao_auth_token",
      value: data.access_token, // field is access_token, not token
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expires_in, // use the exact expiry from the backend
    });

    // ── 4. Set agency slug cookie (client-readable, used by the proxy) ────────
    cookieStore.set({
      name: "active_agency_slug",
      value: data.agency_slug,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expires_in,
    });

    // ── 5. Return minimal payload to the client ───────────────────────────────
    // must_change_password tells the frontend to redirect to /change-password
    return NextResponse.json({
      success: true,
      must_change_password: data.must_change_password,
      agency_name: data.agency_name,
    });
  } catch (error) {
    console.error("[AUTH_LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
