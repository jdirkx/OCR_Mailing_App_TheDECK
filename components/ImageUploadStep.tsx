"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useMail } from "./context";
import type { UploadedImage } from "./context";
import { useRouter } from "next/navigation";
import imageCompression from 'browser-image-compression';
import heic2any from "heic2any";


export default function ImageUploadStep() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { uploadedImages, setUploadedImages } = useMail();
  const [modalImageIdx, setModalImageIdx] = useState<number | null>(null);

  // Handle file selection
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
  if (!e.target.files) return;

  const filesArray = Array.from(e.target.files);

  const compressedImages = await Promise.all(
    filesArray.map(async (file) => {
      let convertedFile = file;

      // Detect and convert HEIC
      if (file.type === "image/heic" || file.type === "image/heif") {
        try {
          const blob = await heic2any({ blob: file, toType: "image/jpeg" });

          // heic2any returns a Blob or Blob[]
          convertedFile = new File(
            [blob as Blob],
            file.name.replace(/\.[^/.]+$/, ".jpg"),
            { type: "image/jpeg" }
          );
          console.log("🔄 Converted HEIC to JPEG:", convertedFile);
        } catch (err) {
          console.error("❌ HEIC conversion failed:", err);
          return null;
        }
      }

      // Now compress the image (converted or not)
      try {
        const compressedFile = await imageCompression(convertedFile, {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 900,
          useWebWorker: true,
        });

        console.log(`✅ Compressed image "${file.name}"`);
        console.log(`- Size: ${(compressedFile.size / 1024).toFixed(2)} KB`);

        return {
          id: crypto.randomUUID(),
          text: "",
          original: {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
          },
          processed: undefined,
          assignedClientId: null,
          sent: false,
        };
      } catch (err) {
        console.error("❌ Compression failed:", err);
        }
      })
    );

    const successful = compressedImages.filter(Boolean) as UploadedImage[];
    setUploadedImages(prev => [...prev, ...successful]);
  }

  // Remove an image by index
  function removeImage(idx: number) {
    setUploadedImages(prev => {
      const img = prev[idx];
      if (img.original?.preview) URL.revokeObjectURL(img.original.preview);
      return prev.filter((_, i) => i !== idx);
    });

    setModalImageIdx(current =>
      current !== null && current === idx
        ? null
        : current !== null && current > idx
          ? current - 1
          : current
    );
  }

  // Proceed to next step (likely a router push or multi-step manager)
  function handleNext() {
    if (uploadedImages.length === 0) {
      alert("Please upload at least one image before proceeding.");
      return;
    }
    router.push('/ocr');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Upload Your Photos
        </h1>

        {/* File Picker */}
        <div className="mb-6 flex flex-col items-center">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mb-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Images
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
          <p className="text-sm text-gray-500">
            You can select multiple images from your gallery.
          </p>
        </div>

        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {uploadedImages.map((img, idx) => (
              <div
                key={idx}
                className="relative cursor-pointer"
                style={{
                  width: 120,
                  height: 120,
                  overflow: "hidden",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
                onClick={() => setModalImageIdx(idx)}
                title="Click to enlarge"
              >
                <Image
                  src={img.original.preview}
                  alt={`Preview ${idx + 1}`}
                  width={120}
                  height={120}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                  aria-label="Remove image"
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
          disabled={uploadedImages.length === 0}
        >
          Next
        </button>
      </div>

      {/* Modal for Enlarged Image with Arrow Navigation */}
      {modalImageIdx !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        >
          
          {/* Close Overlay Button*/}
            <button
              onClick={() => setModalImageIdx(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-md"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

          <div className="relative flex flex-col items-center">
            <Image
              src={uploadedImages[modalImageIdx].original.preview}
              alt={`Enlarged preview ${modalImageIdx + 1}`}
              width={800}
              height={600}
              className="max-h-[80vh] max-w-[80vw] rounded shadow-lg object-contain"
              onClick={e => e.stopPropagation()}
            />
            <div className="mt-4 flex gap-4">
              {/* Back Arrow */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setModalImageIdx(idx =>
                    idx !== null && idx > 0 ? idx - 1 : idx
                  );
                }}
                disabled={modalImageIdx === 0}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {/* Next Arrow */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setModalImageIdx(idx =>
                    idx !== null && idx < uploadedImages.length - 1 ? idx + 1 : idx
                  );
                }}
                disabled={modalImageIdx === uploadedImages.length - 1}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}