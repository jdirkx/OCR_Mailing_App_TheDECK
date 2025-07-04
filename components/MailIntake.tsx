"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { addMailForClient, getAllClients, getClientById } from "@/lib/actions";

// Define the shape of a Client object
type Client = {
  id: number;
  name: string;
  primaryEmail: string;
  secondaryEmails: string[];
};

export default function MailIntake() {
  // State for selected client ID and client details
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // State for image uploads and previews
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // State for mail notes and modal image view
  const [notes, setNotes] = useState("");
  const [modalImage, setModalImage] = useState<string | null>(null);

  // State for the list of companies (clients)
  const [companies, setCompanies] = useState<Client[]>([]);

  // State for form submission and progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Ref for file input (to trigger file picker)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all clients on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesData = await getAllClients();
        setCompanies(companiesData);
      } catch (error) {
        alert("Failed to load companies. Please try again later.");
      }
    };
    fetchCompanies();
  }, []);

  // Fetch selected client details when client selection changes
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

  // Handle image file selection and generate previews
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
      setImagePreviews(filesArray.map(file => URL.createObjectURL(file)));
    }
  }

  // Handle form submission: upload images, save mail, send email
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);

    if (!selectedClientId) {
      alert("Please select a client!");
      setIsSubmitting(false);
      return;
    }
    if (images.length < 1) {
      alert("Please select at least one image!");
      setIsSubmitting(false);
      return;
    }

    try {
      setUploadProgress(25);

      // 1. Upload images (simulate upload)
      const imageUrls = await uploadImages(images);
      setUploadProgress(50);

      // 2. Save mail record to database
      await addMailForClient(selectedClientId, { imageUrls, notes });
      setUploadProgress(75);

      // 3. Fetch the latest client data for accurate CCs
      const freshClient = await getClientById(selectedClientId);
      if (!freshClient) {
        throw new Error("Client not found. Please try again.");
      }

      setUploadProgress(100);

      console.log("secondaryEmails: " + freshClient.secondaryEmails);
      // 4. Send email to primary, CC all current secondary emails
      await sendEmailWithAttachments(
        images,
        freshClient.primaryEmail,
        freshClient.secondaryEmails
      );


      alert("✅ Mail successfully added and email sent!");

      // Reset form state
      setSelectedClientId(null);
      setSelectedClient(null);
      setImages([]);
      setImagePreviews([]);
      setNotes("");
    } catch (error: any) {
      alert(`❌Failed to process mail: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }

  // Send email with attachments, To: primary, CC: all secondary
  async function sendEmailWithAttachments(files: File[], toEmail: string, ccEmails: string[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("attachments", file);
    });
    formData.append("to", toEmail);
    formData.append("subject", `Your mail has arrived at The DECK`);
    formData.append("notes", notes);

    // Add CC field if there are secondary emails
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

  // Simulate image upload (replace with real upload logic as needed)
  async function uploadImages(files: File[]): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return files.map(file => URL.createObjectURL(file));
  }

  // Remove an image from selection and previews
  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  }

  // Prepare client options for the select dropdown
  const clientOptions = companies.map(c => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="mx-auto min-h-screen flex items-start justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          UPLOAD
        </h1>

        {/* Show upload progress bar during submission */}
        {isSubmitting && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Client selection dropdown */}
        <div>
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

        {/* Display recipient and CC emails when a client is selected */}
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

        {/* File picker for mail photos */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Mail Photos
          </label>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-semibold mb-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Files
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
          {/* Show image previews with remove buttons */}
          {imagePreviews.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative">
                  <Image
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover rounded border cursor-pointer"
                    onClick={() => setModalImage(src)}
                  />
                  {/* Remove image button */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Notes textarea */}
        <div>
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

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Submit"}
        </button>

        {/* Modal to show enlarged image preview */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <Image
              src={modalImage}
              alt="Enlarged preview"
              width={800}
              height={600}
              className="max-h-[80vh] max-w-[80vw] rounded shadow-lg object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </form>
    </div>
  );
}
