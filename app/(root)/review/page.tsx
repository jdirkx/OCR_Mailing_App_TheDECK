"use client"
import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Review from "@/components/Review";

export default function Home() {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <div className="font-work-sans bg-white text-black">
          <Review/>
        </div>
      </ProtectedRoute>
    </SessionProvider>
  );
}
