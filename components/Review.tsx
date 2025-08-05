"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useMail } from "./context";
import Select from "react-select";
import { addMailForClient, getAllClients, getClientById } from "@/lib/actions";
import type { MailPayload } from "@/lib/actions";
import type { Client } from "./context" 

export default function ReviewPage() {
  const { companies, setCompanies } = useMail();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [, setSelectedClient] = useState<Client | null>(null);
  const { uploadedImages, clientGroups, setClientGroups, setUploadedImages } = useMail();
  const [modalImageIdx, setModalImageIdx] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingClientId, setPendingClientId] = useState<number | null>(null);


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
  }, [companies.length, setCompanies]);

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
  const clientOptions = companies.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Group images by assignedClientId
  const groupedImages = uploadedImages.reduce((acc, image) => {
    const clientId = image.assignedClientId ?? "UNASSIGNED";
    const key = typeof clientId === "number" ? clientId : "UNASSIGNED";
    if (!acc[key]) acc[key] = [];
    acc[key].push(image);
    return acc;
  }, {} as Record<number | "UNASSIGNED", typeof uploadedImages>);


  // Handle updating notes in the context's clientGroups
    function handleNoteChange(clientId: string | number, newNotes: string) {
      setClientGroups((prev) =>
        prev.map((group) =>
          String(group.clientId) === String(clientId)
            ? { ...group, notes: newNotes }
            : group
        )
      );
    }

  // Update clientGroups when uploadedImages change, ensuring all clientIds exist
  useEffect(() => {
    const uniqueClientIds = Array.from(
      new Set(uploadedImages.map((img) => img.assignedClientId ?? "UNASSIGNED"))
    );

    setClientGroups((prevGroups) => {
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


  async function submitClientGroup(clientId: string | number) {
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      const group = clientGroups.find(g => String(g.clientId) === String(clientId));
      if (!group) throw new Error("Client group not found");

      const images = uploadedImages.filter(
        (img) => String(img.assignedClientId) === String(clientId)
      );

      if (images.length === 0) throw new Error("No images assigned to this client");

      const payload: MailPayload = {
        clientId,
          images: images.map((img) => ({
          preview: img.resizedFile?.preview ?? img.original.preview,
        })),
        files: images
          .map((img) => img.resizedFile?.file ?? img.original.file)
          .filter((file): file is File => file !== undefined),
        notes: group.notes,
      };

      setUploadProgress(25);

      // Save to DB
      await addMailForClient(payload);

      setUploadProgress(50);
      // Get client email data
      const freshClient = await getClientById(Number(clientId));
      if (!freshClient) throw new Error("Client not found");
      
      setUploadProgress(75);

      await sendEmailWithAttachments(
        payload.files,
        payload.notes || '',
        freshClient.primaryEmail,
        freshClient.secondaryEmails
      );

      setUploadProgress(100);

      //Set status as sent
      setClientGroups((prev) =>
        prev.map((group) =>
          String(group.clientId) === String(clientId)
            ? { ...group, sent: true, notes: "" }
            : group
        )
      );

      alert(`✅ Mail for ${freshClient.name} submitted and emailed!`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`❌ Failed to submit for client ${clientId}: ${err.message}`);
      } else {
        alert(`❌ Failed to submit for client ${clientId}: An unknown error occurred.`);
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }

  // Send email with attachments
  async function sendEmailWithAttachments(files: File[], notes: string, toEmail: string, ccEmails: string[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("attachments", file);
    });
    formData.append("to", toEmail);
    formData.append("subject", `Your mail has arrived at The DECK`);
    formData.append("notes", notes);

    if (ccEmails.length > 0) {
      formData.append("cc", ccEmails.join(','));
    }

    const response = await fetch("/api/send-email", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Email sending failed");
    return await response.json();
  }

  // Sort groups: put UNASSIGNED on top
  const groupedEntries = Object.entries(groupedImages).sort(([a], [b]) => {
    if (a === "UNASSIGNED") return -1;
    if (b === "UNASSIGNED") return 1;
    return 0;
  });    

  return (
      <div className="p-6 pt-24">
        {isSubmitting && (
          <div className="w-full bg-gray-100 py-4 fixed top-0 left-0 right-0 z-50 shadow-md">
            <div className="max-w-5xl mx-auto px-6">
              <div className="mb-2 text-sm text-gray-700 font-medium">📤 Submitting mail...</div>
              <div className="w-full bg-gray-300 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4">Review Uploaded Images</h1>

    {groupedEntries.map(([clientId, images]) => {
      const isSent = clientGroups.find(
        (g) => String(g.clientId) === String(clientId)
      )?.sent;

      return (
        <div
          key={clientId}
          className={`client-group mb-8 border rounded p-4 shadow ${
            isSent
              ? "bg-gray-300 text-gray-800"
              : clientId === "UNASSIGNED"
              ? "bg-yellow-100 border-yellow-400 text-red-600"
              : "bg-white text-gray-800"
          }`}
        >
          {/* Heading with "Sent" badge */}
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            {clientId === "UNASSIGNED"
              ? "⚠️ Unassigned Images"
              : companies.find((c) => c.id === Number(clientId))?.name ??
                `Client ${clientId}`}
            {isSent && (
              <span className="px-2 py-1 text-sm bg-green-200 text-green-800 rounded-full">
                ✅ Sent
              </span>
            )}
          </h2>

          {/* Image grid */}
          <div className="flex flex-wrap gap-4 mb-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="border rounded overflow-hidden cursor-pointer"
                onClick={() =>
                  setModalImageIdx(uploadedImages.indexOf(img))
                }
                title="Click to enlarge"
              >
                <Image
                  src={img.resizedFile?.preview ?? img.original.preview}
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
              clientGroups.find(
                (g) => String(g.clientId) === String(clientId)
              )?.notes || ""
            }
            onChange={(e) => handleNoteChange(clientId, e.target.value)}
            placeholder={`Notes for ${
              clientId === "UNASSIGNED"
                ? "Unassigned"
                : companies.find((c) => c.id === Number(clientId))?.name ??
                  `Client ${clientId}`
            }`}
            className="w-full border rounded p-2 text-gray-700"
            rows={3}
          />

          {/* Submit button */}
          {clientId !== "UNASSIGNED" && !isSent && (
            <button
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={isSubmitting}
              onClick={() => {
                setPendingClientId(Number(clientId));
                setShowConfirm(true);
              }}
            >
              Submit for{" "}
              {companies.find((c) => c.id === Number(clientId))?.name}
            </button>
          )}
        </div>
      );
    })}

    {/* Confirmation Overlay */}
      {showConfirm && pendingClientId !== null && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Confirm Submission</h2>
          <p className="mb-6">Are you sure you want to submit this mail?</p>
          <div className="flex justify-center gap-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={async () => {
                setShowConfirm(false);
                if (pendingClientId !== null) {
                  await submitClientGroup(pendingClientId);
                  setPendingClientId(null);
                }
              }}
            >
              Yes, Submit
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              onClick={() => {
                setShowConfirm(false);
                setPendingClientId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      )}


      {/* Modal */}
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
              src={uploadedImages[modalImageIdx].processed?.preview ?? uploadedImages[modalImageIdx].original.preview}
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
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