"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { addMailForClient, getAllClients, getClientById } from "@/lib/actions";

type Client = {
  id: number;
  name: string;
  primaryEmail: string;
  secondaryEmails: string[];
};

type MailIntakeStep2Props = {
  uploadedImages: File[];
  imagePreviews: string[];
  onDone: () => void;
};

export default function MailIntakeStep2({
  uploadedImages,
  imagePreviews,
  onDone,
}: MailIntakeStep2Props) {
  const [companies, setCompanies] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Track which images have been used/submitted
  const [used, setUsed] = useState<boolean[]>(uploadedImages.map(() => false));
  // Track which images are currently selected for submission
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  // Overlay/modal state
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Notes for the mail
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Next and back button for enlarged images
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

  // Overlay: toggle selection of an image
  function toggleSelect(idx: number) {
    if (used[idx]) return;
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  }

  // Overlay: open
  function openOverlay() {
    setOverlayOpen(true);
  }

  // Overlay: close
  function closeOverlay() {
    setOverlayOpen(false);
  }

  // To open modal for a specific image
  function expandImage(idx: number, e: React.MouseEvent) {
    e.stopPropagation();
    setModalImageIdx(idx);
  }

  // To close modal
  function closeModal() {
    setModalImageIdx(null);
  }

  // Remove a selected image from the current selection
  function removeSelected(idx: number) {
    setSelectedIndices(prev => prev.filter(i => i !== idx));
  }

  // Prepare client options for the select dropdown
  const clientOptions = companies.map(c => ({
    value: c.id,
    label: c.name,
  }));

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation handled here, not via disabled button
    if (!selectedClientId) {
      alert("Please select a client!");
      return;
    }
    if (selectedIndices.length < 1) {
      alert("Please select at least one image!");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      setUploadProgress(25);

      // Only send selected images
      const selectedFiles = selectedIndices.map(idx => uploadedImages[idx]);
      const imageUrls = await uploadImages(selectedFiles);
      setUploadProgress(50);

      await addMailForClient(selectedClientId, { imageUrls, notes });
      setUploadProgress(75);

      // Fetch the latest client data for accurate CCs
      const freshClient = await getClientById(selectedClientId);
      if (!freshClient) throw new Error("Client not found.");

      setUploadProgress(100);

      await sendEmailWithAttachments(
        selectedFiles,
        freshClient.primaryEmail,
        freshClient.secondaryEmails
      );

      alert("✅ Mail successfully added and email sent!");

      // Mark submitted images as used
      setUsed(prev => prev.map((v, i) => (selectedIndices.includes(i) ? true : v)));
      setSelectedIndices([]);
      setNotes("");
      setSelectedClientId(null);
      setSelectedClient(null);
      setOverlayOpen(false);
    } catch (error: any) {
      alert(`❌Failed to process mail: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }

  // Simulate image upload (replace with real upload logic as needed)
  async function uploadImages(files: File[]): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return files.map(file => URL.createObjectURL(file));
  }

  // Send email with attachments
  async function sendEmailWithAttachments(files: File[], toEmail: string, ccEmails: string[]) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Select Images and Assign to Client
        </h1>

        {/* Progress bar */}
        {isSubmitting && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Client selection */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Select Client
          </label>
          <Select
            options={clientOptions}
            onChange={option => setSelectedClientId(option ? option.value : null)}
            placeholder="Search or select a Client..."
            className="text-black"
            isSearchable
            value={clientOptions.find(opt => opt.value === selectedClientId) || null}
          />
        </div>

        {/* Email info */}
        {selectedClient && (
          <div className="mb-3">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">To:</span> {selectedClient.primaryEmail}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">CC:</span>{" "}
              {selectedClient.secondaryEmails.length > 0
                ? selectedClient.secondaryEmails.join(", ")
                : <span className="italic text-gray-400">None</span>
              }
            </div>
          </div>
        )}

        {/* Choose Images button */}
        <button
          type="button"
          className="w-full mb-4 bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition-colors font-semibold"
          onClick={openOverlay}
          disabled={uploadedImages.length === 0}
        >
          Choose Images
        </button>

        {/* Previews of selected images */}
        {selectedIndices.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {selectedIndices.map(idx => (
              <div key={idx} className="relative">
                <Image
                  src={imagePreviews[idx]}
                  alt={`Preview ${idx + 1}`}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover rounded border"
                  style={{
                    opacity: used[idx] ? 0.5 : 1,
                    filter: used[idx] ? "grayscale(100%)" : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeSelected(idx)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Add any notes for this mail..."
          />
        </div>

        {/* Submit button - only disabled while submitting */}
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>

      {/* Overlay for selecting images */}
      {overlayOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl w-full flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Select Images</h2>
            <div
              className="grid gap-6 justify-center mb-6"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                width: "100%",
              }}
            >
              {imagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className={`relative border-2 rounded cursor-pointer transition-all duration-150 ${
                    used[idx]
                      ? "border-gray-300 opacity-50 grayscale c"
                      : selectedIndices.includes(idx)
                        ? "border-blue-600 ring-2 ring-blue-400"
                        : "border-gray-300"
                  }`}
                  style={{
                    width: 160,
                    height: 160,
                    overflow: "hidden",
                    background: "#f9fafb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => toggleSelect(idx)}
                >
                  <Image
                    src={src}
                    alt={`Overlay Preview ${idx + 1}`}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                  {/* Checkmark for selected */}
                  {selectedIndices.includes(idx) && !used[idx] && (
                    <div className="absolute top-2 left-2 bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {/* Eye icon for expand */}
                  <button
                    type="button"
                    className="absolute bottom-2 left-2 bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center"
                    style={{ zIndex: 2 }}
                    onClick={e => expandImage(idx, e)}
                    title="View image"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={closeOverlay}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {modalImageIdx !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeModal}
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
                onClick={e => { e.stopPropagation(); setModalImageIdx(idx => idx! - 1); }}
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
                onClick={e => { e.stopPropagation(); setModalImageIdx(idx => idx! + 1); }}
                disabled={modalImageIdx === imagePreviews.length - 1}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Done button to reset everything */}
      <button
        type="button"
        onClick={onDone}
        className="mt-8 w-full max-w-2xl bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition-colors font-semibold"
      >
        Done
      </button>
    </div>
  );
}
