import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Buffer } from 'buffer';
import dotenv from 'dotenv';

dotenv.config();

let client: ImageAnnotatorClient;
try {
  if (process.env.GOOGLE_CLOUD_VISION_SA_KEY) {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_VISION_SA_KEY);
    client = new ImageAnnotatorClient({ credentials });
  } else {
    client = new ImageAnnotatorClient();
  }
} catch (error) {
  console.error("Failed to initialize Google Cloud Vision client:", error);
  throw new Error("Cloud Vision client initialization failed.");
}


export async function POST(req: Request) {
  if (!client) {
    return NextResponse.json({ error: "Cloud Vision client not initialized." }, { status: 500 });
  }

  try {
    const { imageDataUrl } = await req.json();

    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid imageDataUrl' }, { status: 400 });
    }

    const base64Data = imageDataUrl.split(',')[1];
    if (!base64Data) {
      return NextResponse.json({ error: 'Invalid Data URL format' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');

    const [result] = await client.textDetection({
      image: {
        content: imageBuffer,
      },
    });

    const detections = result.textAnnotations;
    const fullText = detections && detections.length > 0 ? detections[0].description : '';

    return NextResponse.json({ ocrText: fullText });

  } catch (error: any) {
    console.error('Google Cloud Vision API error:', error);
    return NextResponse.json({ error: `OCR processing failed: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}