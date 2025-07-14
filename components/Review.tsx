"use client";

import React from "react";
import Image from "next/image";
import { useMail } from "./context";

export default function ReviewPage() {
  const { uploadedImages, clearMail } = useMail();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Review Uploaded Mail
        </h1>

        {uploadedImages.length === 0 ? (
          <p className="text-center text-gray-600">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="border rounded p-3 flex flex-col items-center">
                <Image
                  src={img.preview}
                  alt={`Uploaded ${idx + 1}`}
                  width={160}
                  height={160}
                  className="rounded mb-2 object-cover"
                />
                <p className="text-sm text-gray-600">
                  <strong>OCR Text:</strong> {img.ocrText || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Assigned Client:</strong>{" "}
                  {img.assignedClientId !== null ? img.assignedClientId : "Unassigned"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {img.notes || "None"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Sent:</strong> {img.sent ? "✅ Yes" : "❌ No"}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={clearMail}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors font-semibold"
        >
          Clear All Images
        </button>
      </div>
    </div>
  );
}
