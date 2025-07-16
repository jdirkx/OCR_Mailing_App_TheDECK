"use client"
import { SessionProvider } from "next-auth/react";
import ClientPage from "@/components/ClientsList";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <div className="font-work-sans bg-white text-black">
          <ClientPage />
        </div>
      </ProtectedRoute>
    </SessionProvider>
  );
}
