import createClient from "openapi-fetch";
import type { paths } from "@emakao/api-types";

/**
 * Typed HTTP client backed by the OpenAPI schema.
 *
 * In web-staff, requests are routed through the Next.js proxy at /api/proxy,
 * which forwards them to the Axum backend and automatically attaches the
 * HTTP-only auth cookie as a Bearer token + the X-Agency-Slug header.
 *
 * For a mobile / server-side context, call `createApiClient` instead and
 * supply the real base URL + an Authorization header directly.
 */
export const apiClient = createClient<paths>({
  baseUrl: "/api/proxy",
});

/**
 * Factory for environments that cannot rely on the Next.js proxy
 * (e.g. the mobile app or a server-to-server call).
 *
 * @example
 * const client = createApiClient({
 *   baseUrl: process.env.API_URL,
 *   headers: { Authorization: `Bearer ${token}` },
 * });
 */
export function createApiClient(
  init: Parameters<typeof createClient<paths>>[0]
) {
  return createClient<paths>(init);
}

export type { paths };
