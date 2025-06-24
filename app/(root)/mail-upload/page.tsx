"use client"
import { SessionProvider, useSession } from "next-auth/react";
import MailIntakeDemo from "@/app/components/MailIntake";
import ProtectedRoute from "@/app/components/ProtectedRoute";

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
