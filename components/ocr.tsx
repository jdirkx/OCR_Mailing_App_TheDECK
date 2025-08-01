"use client";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv: any;
  }
}

import { useMail } from "./context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProcessStep() {
  const router = useRouter();
  const { uploadedImages, setUploadedImages, companies } = useMail();
  const [processedCount, setProcessedCount] = useState(0);
  const [cvReady, setCvReady] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const totalImages = uploadedImages.length;

  // Load OpenCV
  useEffect(() => {
    console.log("loading opencv")
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
      console.log("opencv ready")
    }
  }, []);

  // Process images and assign client IDs when OpenCV is ready
  useEffect(() => {
      console.log({
    cvReady,
    uploadedImagesLength: uploadedImages.length,
    hasProcessed,
    companiesLength: companies.length,
  });
    if (!cvReady || uploadedImages.length === 0 || hasProcessed || companies.length === 0) return;
    console.log("passed first if")
    const processAllImages = async () => {
      const updatedImages = await Promise.all(
        uploadedImages.map(async (img) => {
          if (img.processed?.ocrText && img.assignedClientId !== null) {
            setProcessedCount((prev) => prev + 1);
            return img;
          }
          console.log("making image src")
          const file = img.original.file;
          const objectUrl = URL.createObjectURL(file);
          const image = new Image();
          image.src = objectUrl;

          try {
            console.log("time to try")
            await image.decode();

            const MAX_DIMENSION = 1000;
            const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
            const newWidth = Math.round(image.width * scale);
            const newHeight = Math.round(image.height * scale);

            const canvas = document.createElement("canvas");
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return img;

            ctx.drawImage(image, 0, 0, newWidth, newHeight);
            URL.revokeObjectURL(objectUrl);
            console.log("resizing")
            // Resizing for email attachment
            const resizedBlob = await new Promise<Blob>((resolve, reject) =>
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to create blob from canvas."));
              }, "image/jpeg", 0.9)
            );
            const resizedFile = new File([resizedBlob], `resized-${file.name}`, { type: "image/jpeg" });
            const resizedPreview = canvas.toDataURL("image/jpeg", 0.9);
            console.log("ocr processing")
            // OCR processing
            const imageDataUrlToSend = canvas.toDataURL("image/jpeg", 0.9);
            const response = await fetch("/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageDataUrl: imageDataUrlToSend }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const ocrText = data.ocrText;

            // Matching logic
            console.log("matching")
            let assignedClientId = null;
            const strippedOcrText = ocrText.toLowerCase().replace(/\s/g, "");
            for (const company of companies) {
              const strippedName = company.name.toLowerCase().replace(/\s/g, "");
              if (strippedOcrText.includes(strippedName)) {
                assignedClientId = company.id;
                console.log("MATCH FOUND for:", company.name);
                break;
              }
            }

            setProcessedCount((prev) => prev + 1);

            return {
              ...img,
              processed: { preview: img.original.preview, ocrText },
              resizedFile: { file: resizedFile, preview: resizedPreview },
              assignedClientId,
          }
          } catch (err){
            console.error("Failed to process image", err);
            setProcessedCount((prev) => prev + 1);
            return img;
          }
 
      })
    );

    setUploadedImages(updatedImages);
    setHasProcessed(true);
  };

  processAllImages();
}, [cvReady, uploadedImages, hasProcessed, companies, setUploadedImages]);


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
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Processing Images...</h1>
        <p className="text-gray-600">
          We&apos;re matching and processing your images. This might take a moment.
        </p>
        <p className="mt-4 text-lg font-bold">
          Progress: {processedCount} / {totalImages}
        </p>
      </div>
    </div>
  );
}