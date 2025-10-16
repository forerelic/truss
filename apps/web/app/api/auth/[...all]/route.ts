import { auth } from "@truss/auth/server";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

/**
 * Better Auth API handler for Next.js with CORS support.
 *
 * @see https://github.com/better-auth/better-auth/issues/4343
 */

// Force dynamic rendering to prevent static generation during build
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// List of allowed origins (matching trustedOrigins in auth server)
const ALLOWED_ORIGINS = [
  "http://localhost:1420", // Precision
  "http://localhost:1421", // Momentum
  "http://localhost:3000", // Web
  "tauri://localhost",
  "https://tauri.localhost",
];

/**
 * Add CORS headers to the response
 */
function addCorsHeaders(response: Response, origin: string | null) {
  // Clone the response to modify headers
  const modifiedResponse = new Response(response.body, response);

  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    modifiedResponse.headers.set("Access-Control-Allow-Origin", origin);
    modifiedResponse.headers.set("Access-Control-Allow-Credentials", "true");
    modifiedResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    modifiedResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return modifiedResponse;
}

// Get the handlers from Better Auth
const handlers = toNextJsHandler(auth);

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  return addCorsHeaders(new Response(null, { status: 200 }), origin);
}

/**
 * Handle GET requests with CORS headers
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = await handlers.GET(request);

  return addCorsHeaders(response, origin);
}

/**
 * Handle POST requests with CORS headers
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = await handlers.POST(request);

  return addCorsHeaders(response, origin);
}
