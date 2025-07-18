import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/actions"; // Use your shared, typed logger

export async function POST(req: NextRequest) {
  try {
    const { email, userName, action, meta } = await req.json();

    // Input validation
    if (typeof action !== "string" || !action) {
      return NextResponse.json({ error: "Missing or invalid 'action'" }, { status: 400 });
    }

    if (!userName) {
      return NextResponse.json({ error: "Missing or invalid 'userName'" }, { status: 400 });
    }

    await auditLog({ email: email ?? "", userName, action, meta });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Audit log API error:", err);
    return NextResponse.json({ error: "Audit log failed" }, { status: 500 });
  }
}
