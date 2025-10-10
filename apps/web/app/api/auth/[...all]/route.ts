import { auth } from "@truss/ui/lib/auth/server";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Better Auth API handler for Next.js
 *
 * This route handles all authentication requests from:
 * - Web application (same origin)
 * - Desktop applications (Precision & Momentum via CORS)
 *
 * All requests to /api/auth/* are processed by Better Auth
 */

// Force dynamic rendering - don't try to statically generate this route
// This prevents Next.js from trying to execute the auth handler during build time
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Convert Better Auth to Next.js route handlers
const authHandler = toNextJsHandler(auth);

// Handle CORS for desktop apps
function corsHeaders(origin: string | null) {
  // In production, validate the origin
  const allowedOrigins = [
    "http://localhost:1420", // Tauri dev server
    "http://localhost:1421", // Alternative Tauri port
    "tauri://localhost", // Tauri production
    "https://tauri.localhost", // Tauri production HTTPS
    process.env.NEXT_PUBLIC_APP_URL, // Production web URL
  ].filter(Boolean);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept",
  };

  // Check if origin is allowed
  if (
    origin &&
    (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development")
  ) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (process.env.NODE_ENV === "development") {
    // In development, allow any localhost origin
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

// Handle GET requests
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = await authHandler.GET(request);

  // Add CORS headers to the response
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Handle POST requests
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = await authHandler.POST(request);

  // Add CORS headers to the response
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
