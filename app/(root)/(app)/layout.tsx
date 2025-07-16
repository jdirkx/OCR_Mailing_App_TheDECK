// app/(root)/protected-layout.tsx
"use client";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

// This layout will wrap all protected pages under /app/(root)/ directory that use this layout
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <Navbar />
        {children}
      </ProtectedRoute>
    </SessionProvider>
  );
}
