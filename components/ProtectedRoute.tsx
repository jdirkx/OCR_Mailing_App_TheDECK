"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

// Inline IdentifyUser form for demo/testing
function IdentifyUser() {
  const { update } = useSession();
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/validate-user-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });
    const data = await res.json();

    if (res.ok && data.valid) {
      await update({ userName: name, userCode: code });
      console.log("[IdentifyUser] Updated session, reloading...");
      window.location.reload();
      return;
    }
    setError(data?.message || "Invalid code or name. Please try again.");
    setSubmitting(false);
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
      <label className="block mb-2 font-medium">User Code</label>
      <input
        type="password"
        className="w-full mb-4 border rounded px-3 py-2"
        value={code}
        disabled={submitting}
        onChange={e => setCode(e.target.value)}
        required
      />
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className={"w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold " +
          (submitting ? "opacity-50 cursor-not-allowed" : "")}
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
  if (!session.userName || !session.userCode) {
    console.log("[ProtectedRoute] Missing userName/userCode, showing IdentifyUser");
    return <IdentifyUser />;
  }

  // Show children if authenticated & identified
  return <>{children}</>;
}
