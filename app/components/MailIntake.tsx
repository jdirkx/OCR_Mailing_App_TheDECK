"use client";

import React, { useState, useRef } from "react";
import Select from "react-select"

// Integrade database technology
const companies = [
  { id: 1, name: "Acme Corp" },
  { id: 2, name: "Globex Inc." },
  { id: 3, name: "Stark Industries" },
];

export default function MailIntakeDemo() {
  const [selectedClient, setSelectedClient] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [modalImage, setModalImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(
      `Submitted!\nClient: ${selectedClient}\nImages: ${images.length}\nNotes: ${notes}`
    );
    // Replace with actual submit logic
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  }

  const ClientOptions = companies.map(c => ({
    value: c.name,
    label: c.name,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            options={ClientOptions}
            onChange={option => setSelectedClient(option ? option.value : "")}
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
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
        >
          Submit
        </button>

        {/* Modal for enlarged image */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img
              src={modalImage}
              alt="Enlarged preview"
              className="max-h-[80vh] max-w-[80vw] rounded shadow-lg"
              onClick={e => e.stopPropagation()} // Prevent modal close on image click
            />
          </div>
        )}
      </form>
    </div>
    
  );
}
