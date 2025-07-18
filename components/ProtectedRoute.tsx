"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import TransitionLoader from "@/components/TransitionLoader";

function IdentifyUser() {
  const { update, data: session } = useSession();
  const [name, setName] = useState("");
  const [error, setError] = useState(""); // <- This is now actually used
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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
      await new Promise(r => setTimeout(r, 300));
      router.replace("/mail-upload");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Something went wrong: ${message}`);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow text-black">
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
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (status === "unauthenticated" && session === null) {
        router.replace("/");
      }
    } catch (err: unknown) { // <--- don't use `any`!
      const message = err instanceof Error ? err.message : String(err);
      setInternalError("Navigation error: " + message);
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return <TransitionLoader />;
  }

  if (internalError) {
    return <div className="text-red-600">{internalError}</div>;
  }

  if (!session.userName) {
    return <IdentifyUser />;
  }

  return <>{children || <div>Loading content...</div>}</>;
}
