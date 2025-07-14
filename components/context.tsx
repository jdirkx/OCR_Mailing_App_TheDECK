"use client";

import React, { createContext, useContext, useState } from "react";

export type ProcessedImage = {
  file: File;
  preview: string;
  ocrText: string;
  assignedClientId: number | null;
  sent: boolean;
  notes: string;
};

type MailContextType = {
  uploadedImages: ProcessedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  clearMail: () => void;
};

const MailContext = createContext<MailContextType | undefined>(undefined);

export const MailProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploadedImages, setUploadedImages] = useState<ProcessedImage[]>([]);

  const clearMail = () => {
    setUploadedImages([]);
  };

  return (
    <MailContext.Provider value={{ uploadedImages, setUploadedImages, clearMail }}>
      {children}
    </MailContext.Provider>
  );
};

export function useMail() {
  const context = useContext(MailContext);
  if (!context) {
    throw new Error("useMail must be used within a MailProvider");
  }
  return context;
}
