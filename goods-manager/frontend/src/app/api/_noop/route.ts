import { NextResponse } from "next/server";

// Simple no-op endpoint.
// Used only to avoid noisy 404s for certain devtools probes if needed.
export function GET() {
  return NextResponse.json({ ok: true });
}
