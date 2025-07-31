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
  const totalImages = uploadedImages.length;

  // Load OpenCV
  useEffect(() => {
    if (typeof window !== "undefined" && !window.cv && !document.getElementById("opencv-script")) {
      const script = document.createElement("script");
      script.id = "opencv-script";
      script.src = "/opencv/opencv.js";
      script.async = true;
      script.onload = () => {
        window.cv.onRuntimeInitialized = () => setCvReady(true);
      };
      document.body.appendChild(script);
    } else if (window.cv && window.cv.Mat) {
      setCvReady(true);
    }
  }, []);

  // Process images when OpenCV is ready
  useEffect(() => {
    if (!cvReady || uploadedImages.length === 0) return;

    uploadedImages.forEach((img, idx) => {
      if (img.processed?.ocrText) return;

      const processImage = async () => {
        const file = img.original.file;
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.src = objectUrl;

        try {
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(image, 0, 0);
          URL.revokeObjectURL(objectUrl);

          const imageDataUrlToSend = canvas.toDataURL("image/jpeg", 0.9);
          const processedPreview = img.original.preview;

          const response = await fetch("/api/ocr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json", 
            },
            body: JSON.stringify({ imageDataUrl: imageDataUrlToSend }),
          });

            if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const ocrText = data.ocrText

          setUploadedImages((prev) => {
            const updated = [...prev];
            updated[idx].processed = {
              preview: processedPreview,
              ocrText: ocrText,
            };
            return updated;
          });

          setProcessedCount((prev) => prev + 1);
        } catch (err) {
          console.error("Failed to process image", err);
        }
      };

      processImage();
    });
  }, [cvReady, uploadedImages, setUploadedImages]);

  // Navigate to review page when done
  useEffect(() => {
    if (
      totalImages > 0 &&
      processedCount === totalImages &&
      uploadedImages.every((img) => img.processed?.ocrText)
    ) {
      router.push("/review");
    }
  }, [processedCount, uploadedImages, totalImages, router]);

  const uploadProgress = totalImages
    ? Math.round((processedCount / totalImages) * 100)
    : 0;

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

/*
const processImage = async () => {
        const file = img.original.file;
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.src = objectUrl;

        try {
          await image.decode();

          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(image, 0, 0);
          URL.revokeObjectURL(objectUrl);

          const cv = window.cv;
          let src = cv.imread(canvas); 

          let gray = new cv.Mat();
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

          let denoisedGray = new cv.Mat();
          cv.medianBlur(gray, denoisedGray, 3);
          let binary = new cv.Mat();
          cv.adaptiveThreshold(denoisedGray, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 21, 0);

          // --- Resize for display/OCR (as you had it) ---
          const dsize = new cv.Size(canvas.width / 2, canvas.height / 2);
          cv.resize(binary, binary, dsize, 0, 0, cv.INTER_AREA);

          cv.imshow(canvas, binary);
          const processedPreview = canvas.toDataURL("image/png");

          src.delete();
          gray.delete();
          denoisedGray.delete();
          binary.delete();


          
*/