import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RouteContext = { params: Promise<{ path: string[] }> };

/**
 * Single handler function reused for every HTTP method.
 * Next.js App Router does not support an "ANY" export — each method
 * must be exported by its own name (GET, POST, etc.).
 */
async function handler(req: NextRequest, { params }: RouteContext) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const url = new URL(`/${path}`, BACKEND_URL);

  // Forward query string unchanged
  url.search = req.nextUrl.search;

  const cookieStore = await cookies();
  const token = cookieStore.get("emakao_auth_token")?.value;
  const agencySlug =
    cookieStore.get("active_agency_slug")?.value ?? "default";

  const headers = new Headers(req.headers);
  headers.delete("host"); // prevent host header mismatch on the backend
  headers.set("X-Agency-Slug", agencySlug);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: req.body,
      redirect: "manual",
      // "duplex: half" is required by Node.js fetch whenever req.body is a
      // ReadableStream (i.e. for POST / PUT / PATCH with a body). Without it
      // those requests silently drop the body. The standard RequestInit type
      // doesn't include this option yet, so we cast to silence TypeScript.
      duplex: "half",
    } as RequestInit & { duplex: string });

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("[PROXY_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ── Named method exports (the only form Next.js App Router accepts) ───────────
export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const HEAD    = handler;
export const OPTIONS = handler;