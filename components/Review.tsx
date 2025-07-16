"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useMail } from "./context";

export default function ReviewPage() {
  const { uploadedImages, clientGroups, setClientGroups } = useMail();

  // Group images by assignedClientId
  const groupedImages = uploadedImages.reduce((acc, image) => {
    const clientId = image.assignedClientId ?? "unassigned";
    if (!acc[clientId]) {
      acc[clientId] = [];
    }
    acc[clientId].push(image);
    return acc;
  }, {} as Record<string | number, typeof uploadedImages>);

  // Handle updating notes in the context's clientGroups
  function handleNoteChange(clientId: string | number, newNotes: string) {
    setClientGroups((prev) =>
      prev.map((group) =>
        group.clientId === clientId ? { ...group, notes: newNotes } : group
      )
    );
  }

  useEffect(() => {
  const uniqueClientIds = Array.from(
    new Set(uploadedImages.map((img) => img.assignedClientId ?? "unassigned"))
  );

    setClientGroups((prevGroups) => {
        // Avoid duplicates — make a Map for quick lookup
        const groupMap = new Map(prevGroups.map((g) => [g.clientId, g]));

        uniqueClientIds.forEach((clientId) => {
        if (!groupMap.has(clientId)) {
            groupMap.set(clientId, {
            clientId,
            notes: "",
            sent: false,
            });
        }
        });

        return Array.from(groupMap.values());
    });
    }, [uploadedImages, setClientGroups]);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Review Uploaded Images</h1>

      {Object.entries(groupedImages).map(([clientId, images]) => (
        <div key={clientId} className="mb-8 border rounded p-4 bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">
            {clientId === "unassigned" ? "Unassigned" : `Client ${clientId}`}
          </h2>

          {/* Image grid */}
          <div className="flex flex-wrap gap-4 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="border rounded overflow-hidden">
                <Image
                  src={img.preview}
                  alt={`Client ${clientId} Image ${idx + 1}`}
                  width={150}
                  height={150}
                  className="object-cover w-36 h-36"
                />
              </div>
            ))}
          </div>

          {/* Notes input */}
          <textarea
            value={
              clientGroups.find((g) => g.clientId === clientId)?.notes || ""
            }
            onChange={(e) => handleNoteChange(clientId, e.target.value)}
            placeholder={`Notes for ${
              clientId === "unassigned" ? "Unassigned" : `Client ${clientId}`
            }`}
            className="w-full border rounded p-2 text-gray-700"
            rows={3}
          />
        </div>
      ))}
    </div>
  );
}