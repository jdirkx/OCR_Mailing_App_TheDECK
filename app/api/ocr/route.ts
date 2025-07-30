// app/api/ocr/route.ts
import { NextResponse } from "next/server";
import * as tesseract from "node-tesseract-ocr";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    // Convert base64 to buffer
    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Save to /tmp
    const filePath = path.join("/tmp", `ocr-${Date.now()}.png`);
    await writeFile(filePath, buffer);

    const config = {
      lang: "eng+jpn",
      oem: 1,
      psm: 6,
    };

    const text = await tesseract.recognize(filePath, config);
    await unlink(filePath);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("OCR API error:", error.message);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}