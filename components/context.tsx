"use client";

import React, { createContext, useContext, useState } from "react";

export type ProcessedImage = {
  file: File;
  preview: string;
  ocrText: string;
  assignedClientId: number | null;
  sent: boolean;
};

export type ClientGroup = {
  clientId: number | string;
  notes: string;
  sent: boolean;
};

type MailContextType = {
  uploadedImages: ProcessedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  clientGroups: ClientGroup[];
  setClientGroups: React.Dispatch<React.SetStateAction<ClientGroup[]>>;
  clearMail: () => void;
};

const MailContext = createContext<MailContextType | undefined>(undefined);

export const MailProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploadedImages, setUploadedImages] = useState<ProcessedImage[]>([]);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);

  const clearMail = () => {
    setUploadedImages([]);
    setClientGroups([]);  
  };

  return (
    <MailContext.Provider 
      value={{ uploadedImages, setUploadedImages, clientGroups, setClientGroups, clearMail}}>
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
