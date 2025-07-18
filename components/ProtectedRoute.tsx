"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "@/app/loading"; // make sure the path is correct

function IdentifyUser() {
  const { update, data: session } = useSession();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false); // for spinner after submit
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setLoading(true);

    try {
      // Audit log before updating session/user
      await fetch("/api/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email ?? null,
          userName: name,
          action: "LOGIN",
          meta: { timestamp: new Date().toISOString() }
        }),
      });

      await update({ userName: name });

      // Wait for session propagation (Vercel/serverless may lag otherwise)
      await new Promise(r => setTimeout(r, 700));

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
        onChange={e => setName(e.target.value)}
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

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [internalError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" && session === null) {
      router.replace("/");
    }
  }, [status, session, router]);

  if (internalError) {
    return <div className="text-red-600">{internalError}</div>;
  }

  // Loader while fetching session or waiting for update
  if (status === "loading" || !session) {
    return <Loading message="Loading your workspace..." />;
  }

  // Identification-required step
  if (!session.userName) {
    return <IdentifyUser />;
  }

  // Render the protected children (main content)
  return <>{children || <Loading message="Loading page..." />}</>;
}
