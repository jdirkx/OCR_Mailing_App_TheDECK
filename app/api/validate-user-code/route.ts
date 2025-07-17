import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, code } = await req.json();

    if (
      typeof name !== "string" || !name.trim() ||
      typeof code !== "string" || !code.trim()
    ) {
      return NextResponse.json(
        { valid: false, message: "Name and code are required." },
        { status: 400 }
      );
    }

    // Demo mode: Accept name '123' and code '123' as valid
    const match = name === "123" && code === "123";

    if (match) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, message: "Invalid code or name." },
        { status: 401 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { valid: false, message: "Server error." },
      { status: 500 }
    );
  }
}
