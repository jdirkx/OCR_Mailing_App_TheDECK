"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { addMailForClient, getAllClients } from "@/lib/actions";

export default function MailIntake() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch companies from database
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesData = await getAllClients();
        setCompanies(companiesData);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        alert("Failed to load companies. Please try again later.");
      }
    };
    
    fetchCompanies();
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Client-side validation
    if (!selectedClient) {
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
      // Upload images to storage (this is a placeholder - implement your actual upload logic)
      const imageUrls = await uploadImages(images);
      
      // Add mail to database
      await addMailForClient(selectedClient, {
        imageUrls,
        notes
      });
      
      alert("Mail successfully added!");
      
      // Reset form
      setSelectedClient(null);
      setImages([]);
      setImagePreviews([]);
      setNotes("");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit mail. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function uploadImages(files: File[]): Promise<string[]> {
    // Implement your actual image upload logic here
    // This should return an array of image URLs
    return files.map(file => URL.createObjectURL(file));
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  }

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

        {/* Client Dropdown */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Select Client
          </label>
          <Select
            options={clientOptions}
            onChange={option => setSelectedClient(option ? option.value : null)}
            placeholder="Search or select a Client..."
            className="text-black"
            isSearchable
          />
        </div>

        {/* Custom File Picker Button */}
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
                  {/* Remove button */}
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
        
        {/* Notes */}
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

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>

        {/* Modal for enlarged image */}
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
