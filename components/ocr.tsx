"use client";

import { useMail } from "./context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProcessStep() {
  const router = useRouter();
  const { uploadedImages, setUploadedImages, companies } = useMail();
  const totalImages = uploadedImages.length;

  // Combine processing and navigation into a single effect
  useEffect(() => {
    if (uploadedImages.length === 0 || uploadedImages.every(img => img.processed) || companies.length === 0) {
      // If all images are processed, navigate to the review page.
      if (uploadedImages.length > 0 && uploadedImages.every(img => img.processed)) {
        router.push("/review");
      }
      return;
    }

    const processAllImages = async () => {
      const updatedImages = await Promise.all(
        uploadedImages.map(async (img) => {
          // If the image is already processed, skip it.
          if (img.processed?.ocrText && img.assignedClientId !== null) {
            return img;
          }

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
            if (!ctx) throw new Error("Canvas context not available");

            ctx.drawImage(image, 0, 0);
            URL.revokeObjectURL(objectUrl);
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

            return {
              ...img,
              processed: { ocrText },
              assignedClientId,
            };
          } catch (err) {
            console.error("Failed to process image", err);
            return img;
          }
        })
      );
      
      setUploadedImages(updatedImages);
      router.push("/review");
    };

    processAllImages();
  }, [uploadedImages, companies, router, setUploadedImages]);

  const processedCount = uploadedImages.filter(img => img.processed?.ocrText).length;

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