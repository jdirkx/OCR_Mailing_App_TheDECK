"use client"
import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUploadStep from "@/components/ImageUploadStep";

export default function Home() {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <div className="font-work-sans bg-white text-black">
          <ImageUploadStep/>
        </div>
      </ProtectedRoute>
    </SessionProvider>
  );
}
