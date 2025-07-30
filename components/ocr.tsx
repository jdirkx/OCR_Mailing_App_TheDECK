"use client";

declare global {
  interface Window {
    cv: any;
  }
}

import { useMail } from "./context";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProcessStep() {
  const router = useRouter();
  const { uploadedImages, setUploadedImages } = useMail();
  const [cvReady, setCvReady] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  // Load OpenCV
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !window.cv &&
      !document.getElementById("opencv-script")
    ) {
      const script = document.createElement("script");
      script.id = "opencv-script";
      script.src = "/opencv/opencv.js";
      script.async = true;
      script.onload = () => {
        window.cv.onRuntimeInitialized = () => {
          setCvReady(true);
        };
      };
      document.body.appendChild(script);
    } else if (window.cv && window.cv.Mat) {
      setCvReady(true);
    }
  }, []);

  // File -> HTMLImageElement
  function fileToImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Run OCR via API on all uploaded images
  useEffect(() => {
    if (!cvReady || uploadedImages.length === 0) return;

    const runOCRBatch = async () => {
      for (let idx = 0; idx < uploadedImages.length; idx++) {
        const img = uploadedImages[idx];
        if (img.processed?.ocrText) continue;

        try {
          const image = await fileToImageElement(img.original.file);
          await image.decode();

          const scaleFactor = 2;
          const canvas = document.createElement("canvas");
          canvas.width = image.width * scaleFactor;
          canvas.height = image.height * scaleFactor;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          const cv = window.cv;
          const src = cv.imread(canvas);
          const dst = new cv.Mat();

          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
          cv.GaussianBlur(dst, dst, new cv.Size(3, 3), 0);
          cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

          const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
          cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, kernel);
          cv.dilate(dst, dst, kernel);
          cv.erode(dst, dst, kernel);

          cv.imshow(canvas, dst);

          src.delete();
          dst.delete();

          // API call to /api/ocr
          const ocrResponse = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: canvas.toDataURL("image/png"),
            }),
          });

          const textResp = await ocrResponse.text();
            console.error("OCR server response:", textResp);

          if (!ocrResponse.ok) throw new Error("Failed to get OCR result");

          const { text } = await ocrResponse.json();

          setUploadedImages((prev) => {
            const updated = [...prev];
            updated[idx].processed = {
              preview: canvas.toDataURL("image/png"),
              ocrText: text,
            };
            return updated;
          });

          setProcessedCount((prev) => prev + 1);
        } catch (err) {
          console.error("Failed to process image", err);
        }
      }
    };

    runOCRBatch();
  }, [cvReady, uploadedImages, setUploadedImages]);

  // Navigate to review page when done
  useEffect(() => {
    const done =
      uploadedImages.length > 0 &&
      uploadedImages.every((img) => img.processed?.ocrText);

    if (done) {
      router.push("/review");
    }
  }, [uploadedImages, router]);

  // Progress Bar
  const totalImages = uploadedImages.length;
  const completed = uploadedImages.filter((img) => img.processed?.ocrText).length;
  const uploadProgress = totalImages ? Math.round((completed / totalImages) * 100) : 0;

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Processing...</h1>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${uploadProgress}%` }}
        ></div>
      </div>

      <ul className="space-y-4">
        {uploadedImages.map((img, i) => (
          <li key={img.id} className="bg-white shadow p-4 rounded">
            <p className="font-bold mb-2">Image {i + 1}</p>
            <img
              src={img.processed?.preview || img.original.preview}
              className="mb-2 max-w-xs rounded"
              alt={`Processed ${i}`}
            />
            <p className="text-gray-700 whitespace-pre-wrap">
              {img.processed?.ocrText || "Processing..."}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}