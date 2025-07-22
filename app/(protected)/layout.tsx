"use client";
import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <Navbar />
        {children}
      </ProtectedRoute>
    </SessionProvider>
  );
}
