"use client"
import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import MailUploadFlow from "@/components/MailUploadFlow";

export default function Home() {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <div className="font-work-sans bg-white text-black">
          <MailUploadFlow/>
        </div>
      </ProtectedRoute>
    </SessionProvider>
  );
}
