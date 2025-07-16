import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // Uncomment this for real DB lookup

export async function POST(req: NextRequest) {
  try {
    const { name, code } = await req.json();

    // Input validation
    if (
      typeof name !== "string" || !name.trim() ||
      typeof code !== "string" || !code.trim()
    ) {
      return NextResponse.json(
        { valid: false, message: "Name and code are required." },
        { status: 400 }
      );
    }

    // ---- Real database lookup example (uncomment to use) ----
    // const match = await prisma.staffCode.findFirst({
    //   where: { name, code },
    // });
    //
    // Demo mode: 
    const match = name === "Matthew" && code === "1234";
    // ---------------------------------------------------------

    if (match) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, message: "Invalid code or name." },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("validate-user-code error:", err);
    return NextResponse.json(
      { valid: false, message: "Server error." },
      { status: 500 }
    );
  }
}
