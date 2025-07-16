"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useMail } from "./context";
import Select from "react-select";
import { addMailForClient, getAllClients, getClientById } from "@/lib/actions";

type Client = {
  id: number;
  name: string;
  primaryEmail: string;
  secondaryEmails: string[];
};

export default function ReviewPage() {
  const [companies, setCompanies] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { uploadedImages, clientGroups, setClientGroups, setUploadedImages } = useMail();
  const [modalImageIdx, setModalImageIdx] = useState<number | null>(null);

// Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesData = await getAllClients();
        setCompanies(companiesData);
      } catch {
        alert("Failed to load companies.");
      }
    };
    fetchCompanies();
  }, []);

  // Fetch selected client details
  useEffect(() => {
    if (!selectedClientId) {
      setSelectedClient(null);
      return;
    }
    const fetchClient = async () => {
      const client = await getClientById(selectedClientId);
      setSelectedClient(client || null);
    };
    fetchClient();
  }, [selectedClientId]);

    // Prepare client options for the select dropdown
    const clientOptions = companies.map(c => ({
      value: c.id,
      label: c.name,
    }));


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
            <div
              key={idx}
              className="border rounded overflow-hidden cursor-pointer"
              onClick={() => setModalImageIdx(uploadedImages.indexOf(img))}
              title="Click to enlarge"
            >
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

      {modalImageIdx !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImageIdx(null)}
        >
          <div
            className="relative flex flex-col items-center bg-white p-4 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image preview */}
            <Image
              src={uploadedImages[modalImageIdx].preview}
              alt={`Enlarged preview ${modalImageIdx + 1}`}
              width={800}
              height={600}
              className="max-h-[80vh] max-w-[80vw] rounded shadow-lg object-contain"
            />

            {/* Client selection below the image */}
            <div className="my-4 w-80">
              <label className="block mb-1 font-medium text-gray-700">
                Select Client
              </label>
              <Select
                options={clientOptions}
                onChange={(option) => {
                  const clientId = option ? option.value : null;
                  setSelectedClientId(clientId);

                  // Update assignedClientId for this image
                  const updatedImages = [...uploadedImages];
                  if (modalImageIdx !== null) {
                    updatedImages[modalImageIdx] = {
                      ...updatedImages[modalImageIdx],
                      assignedClientId: clientId,
                    };
                  }
                  // Assuming you have setUploadedImages from context
                  setUploadedImages(updatedImages);
                }}
                placeholder="Search or select a Client..."
                className="text-black"
                isSearchable
                value={
                  clientOptions.find(
                    (opt) =>
                      opt.value === uploadedImages[modalImageIdx].assignedClientId
                  ) || null
                }
              />
            </div>

            {/* Navigation arrows */}
            <div className="flex gap-4 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIdx((idx) => (idx !== null && idx > 0 ? idx - 1 : idx));
                }}
                disabled={modalImageIdx === 0}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIdx((idx) =>
                    idx !== null && idx < uploadedImages.length - 1 ? idx + 1 : idx
                  );
                }}
                disabled={modalImageIdx === uploadedImages.length - 1}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
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