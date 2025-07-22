"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "@/app/loading";

/**
 * Component shown when a logged-in user is missing a userName.
 */
function IdentifyUser() {
  const { update, data: session } = useSession();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setLoading(true);

    try {
      await fetch("/api/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email ?? null,
          userName: name,
          action: "LOGIN",
          meta: { timestamp: new Date().toISOString() },
        }),
      });

      await update({ userName: name });

      router.replace("/mail-upload");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown error";

      setError("Something went wrong: " + message);
      setSubmitting(false);
      setLoading(false);
    }
  };

  // Show spinner after clicking submit
  if (loading) return <Loading message="Almost ready..." />;

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
        onChange={(e) => setName(e.target.value)}
        required
      />
      {session?.user?.email && (
        <div className="mb-4 text-sm text-gray-500">
          Signing in as <b>{session.user.email}</b>
        </div>
      )}
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

/**
 * Entry point for all protected pages.
 * Requires a valid NextAuth session + userName.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && session === null) {
      router.replace("/login"); // Redirect if not logged in
    }
  }, [status, session, router]);

  // Show a loading spinner while auth is loading
  if (status === "loading" || !session) {
    return <IdentifyUser />;
    // return <Loading message="Loading your workspace..." />;
  }

  // Ask for name if logged in but session.userName is missing
  if (!session.userName) {
    return <IdentifyUser />;
  }

  // Authenticated and identified — render page
  return <>{children}</>;
}
