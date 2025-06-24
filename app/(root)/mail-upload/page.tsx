"use client"
import { SessionProvider, useSession } from "next-auth/react";
import MailIntakeDemo from "@/app/components/MailIntake";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function Home() {
  return (
    <SessionProvider>
      <div className="font-work-sans bg-white text-black">
        <ProtectedRoute>
            <MailIntakeDemo />
        </ProtectedRoute>
      </div>
    </SessionProvider>
  );
}
