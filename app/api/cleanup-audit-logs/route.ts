import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoff },
    },
  });

  return NextResponse.json({ deleted: result.count });
}
