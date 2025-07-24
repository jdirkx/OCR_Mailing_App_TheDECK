"use client"
import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProcessStep from "@/components/ocr";

export default function Home() {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <div className="font-work-sans bg-white text-black">
          <ProcessStep/>
        </div>
      </ProtectedRoute>
    </SessionProvider>
  );
}
