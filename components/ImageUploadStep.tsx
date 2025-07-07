"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

type ImageUploadStepProps = {
  onNext: (images: File[], previews: string[]) => void;
};

export default function ImageUploadStep({ onNext }: ImageUploadStepProps) {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [modalImageIdx, setModalImageIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection and generate previews
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      setImagePreviews(prev => [
        ...prev,
        ...filesArray.map(file => URL.createObjectURL(file)),
      ]);
    }
  }

  // Remove an image from both state arrays
  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    // If the removed image is currently enlarged, close the modal
    setModalImageIdx(current =>
      current !== null && current === idx
        ? null
        : current !== null && current > idx
          ? current - 1
          : current
    );
  }

  // Proceed to next step
  function handleNext() {
    if (images.length === 0) {
      alert("Please upload at least one image before proceeding.");
      return;
    }
    onNext(images, imagePreviews);
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
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {imagePreviews.map((src, idx) => (
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
                  src={src}
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
          disabled={images.length === 0}
        >
          Next
        </button>
      </div>

      {/* Modal for Enlarged Image with Arrow Navigation */}
      {modalImageIdx !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImageIdx(null)}
        >
          <div className="relative flex flex-col items-center">
            <Image
              src={imagePreviews[modalImageIdx]}
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
                    idx !== null && idx < imagePreviews.length - 1 ? idx + 1 : idx
                  );
                }}
                disabled={modalImageIdx === imagePreviews.length - 1}
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
