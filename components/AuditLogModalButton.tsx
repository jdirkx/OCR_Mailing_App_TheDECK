"use client";
import React, { useState } from "react";

export default function AuditLogModalButton({ logList }: { logList: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition duration-150 mb-8"
        onClick={() => setOpen(true)}
      >
        View Audit Log
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-900"
              aria-label="Close audit log"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">Audit Log</h2>
            <div className="max-h-[60vh] overflow-y-auto">{logList}</div>
          </div>
        </div>
      )}
    </>
  );
}
