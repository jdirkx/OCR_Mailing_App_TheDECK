"use client"
import { SessionProvider } from "next-auth/react";
import MailIntakeDemo from "@/components/MailIntake";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <div className="font-work-sans bg-white text-black">
          <MailIntakeDemo />
        </div>
      </ProtectedRoute>
    </SessionProvider>
  );
}
