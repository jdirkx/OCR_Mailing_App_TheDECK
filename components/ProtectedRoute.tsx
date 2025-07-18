"use client";
import { auditLog } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Inline IdentifyUser form for demo/testing
function IdentifyUser() {
  const { update } = useSession();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!name.trim()) {
      setError("Name is required.");
      setSubmitting(false);
      return;
    }

    try {
      await update({ userName: name });
      
      // Audit log: user identified themselves
      await auditLog({
        email: null, // user may not be fully logged in, or grab from session/user if available
        userName: name,
        action: "IDENTIFY_USER",
        meta: { timestamp: new Date().toISOString() },
      });

      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow text-black"
    >
      <h2 className="text-xl mb-4 font-bold text-center">Identify Yourself</h2>
      <label className="block mb-2 font-medium">Name</label>
      <input
        type="text"
        className="w-full mb-4 border rounded px-3 py-2"
        value={name}
        autoFocus
        disabled={submitting}
        onChange={e => setName(e.target.value)}
        required
      />
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className={
          "w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold " +
          (submitting ? "opacity-50 cursor-not-allowed" : "")
        }
      >
        {submitting ? "Identifying..." : "Continue"}
      </button>
    </form>
  );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && session === null) {
      // Only redirect when session is truly unauthenticated, not just "flickering"
      console.log("[ProtectedRoute] Unauthenticated (confirmed), redirecting to /");
      router.replace("/");
    }
    // else if (status === "loading") {
    //   Do nothing, don't redirect
    // }
  }, [status, session, router]);

  if (status === "loading" || !session) return <div>Loading...</div>;

  // If fields are missing, prompt for identify
  if (!session.userName) {
    console.log("[ProtectedRoute] Missing userName, showing IdentifyUser");
    return <IdentifyUser />;
  }

  // Show children if authenticated & identified
  return <>{children}</>;
}
