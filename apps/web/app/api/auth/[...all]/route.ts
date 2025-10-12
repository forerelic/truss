import { auth } from "@truss/auth/server";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Better Auth API handler for Next.js.
 * Handles all authentication requests from web and desktop applications.
 */

// Force dynamic rendering to prevent static generation during build
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const authHandler = toNextJsHandler(auth);
function corsHeaders(origin: string | null) {
  const allowedOrigins = [
    "http://localhost:1420",
    "http://localhost:1421",
    "tauri://localhost",
    "https://tauri.localhost",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
  };

  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development")) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (process.env.NODE_ENV === "development") {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = await authHandler.GET(request);

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

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = await authHandler.POST(request);

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
