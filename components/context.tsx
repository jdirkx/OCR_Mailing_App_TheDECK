"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllClients } from "@/lib/actions"; // <-- Import the function to fetch clients

export type UploadedImage = {
  id: string;
  text: string;
  original: {
    preview: string;
    file: File;
  };
  processed?: {
    preview?: string;
    ocrText?: string;
  };
  assignedClientId: number | null;
  resizedFile?: {
    preview?: string;
    file?: File;
  };
  sent: boolean;
};

export type ClientGroup = {
  clientId: number | string;
  notes: string;
  sent: boolean;
};

export type Client = {
  id: number;
  name: string;
  primaryEmail: string;
  secondaryEmails: string[];
};

type MailContextType = {
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  clientGroups: ClientGroup[];
  setClientGroups: React.Dispatch<React.SetStateAction<ClientGroup[]>>;
  companies: Client[];
  setCompanies: React.Dispatch<React.SetStateAction<Client[]>>;
  clearMail: () => void;
};

const MailContext = createContext<MailContextType | undefined>(undefined);

export const MailProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [companies, setCompanies] = useState<Client[]>([]);

  // NEW: Fetch companies when the provider mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log("Fetching companies from API...");
        const companiesData = await getAllClients();
        setCompanies(companiesData);
        console.log("Companies loaded successfully:", companiesData.length);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };

    fetchCompanies();
  }, []); // The empty dependency array ensures this runs only once

  const clearMail = () => {
    setUploadedImages([]);
    setClientGroups([]);
    // Do not clear companies here, as they are part of the app's state
  };

  return (
    <MailContext.Provider
      value={{
        uploadedImages,
        setUploadedImages,
        clientGroups,
        setClientGroups,
        companies,
        setCompanies,
        clearMail,
      }}
    >
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