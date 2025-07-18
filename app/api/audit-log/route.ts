import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, userName, action, meta } = await req.json();
  await prisma.auditLog.create({
    data: { email, userName, action, meta },
  });
  return NextResponse.json({ success: true });
}

