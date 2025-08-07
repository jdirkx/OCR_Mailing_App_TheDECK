"use client";

import { useMail } from "./context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProcessStep() {
  const router = useRouter();
  const { uploadedImages, setUploadedImages, companies } = useMail();
  const [processedCount, setProcessedCount] = useState(0);
  const [hasProcessed, setHasProcessed] = useState(false);
  const totalImages = uploadedImages.length;

  // Process images and assign client IDs
  useEffect(() => {
    if (uploadedImages.length === 0 || hasProcessed || companies.length === 0) return;

    const processAllImages = async () => {
      const updatedImages = await Promise.all(
        uploadedImages.map(async (img) => {
          if (img.processed?.ocrText && img.assignedClientId !== null) {
            setProcessedCount((prev) => prev + 1);
            return img;
          }

          const file = img.original.file;
          const objectUrl = URL.createObjectURL(file);
          const image = new Image();
          image.src = objectUrl;

          try {
            await image.decode();

            // Resize
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

            // Convert canvas to blob for resized file
            const resizedBlob = await new Promise<Blob>((resolve, reject) =>
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to create blob from canvas."));
              }, "image/jpeg", 0.9)
            );
            const resizedFile = new File([resizedBlob], `resized-${file.name}`, { type: "image/jpeg" });
            const resizedPreview = canvas.toDataURL("image/jpeg", 0.9);

            // OCR
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

            // Match to client
            let assignedClientId = null;
            const strippedOcrText = ocrText.toLowerCase().replace(/\s/g, "");
            for (const company of companies) {
              const strippedName = company.name.toLowerCase().replace(/\s/g, "");
              if (strippedOcrText.includes(strippedName)) {
                assignedClientId = company.id;
                break;
              }
            }

            setProcessedCount((prev) => prev + 1);

            return {
              ...img,
              processed: { preview: img.original.preview, ocrText },
              resizedFile: { file: resizedFile, preview: resizedPreview },
              assignedClientId,
            };
          } catch (err) {
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
  }, [uploadedImages, hasProcessed, companies, setUploadedImages]);

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