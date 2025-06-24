'use client';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react"; // or your auth hook
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // If already logged in, redirect to mail-upload screen
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/mail-upload");
    }
  }, [status, router]);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("google"); // or your provider
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white centered-container">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            <div className="flex flex-col items-center mb-6">
            <Image src="/logo.png" alt="Logo" width={96} height={32} />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="text-gray-500 text-sm mt-1">to access the mailing system</p>
            </div>
            <form
            action={async () => {
                await signIn("google");
            }}
            >
            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold cursor-pointer"
            >
                Sign in with Google
            </button>
            </form>
        </div>
        <p className="mt-6 text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} The DECK. All rights reserved.
        </p>
        </div>
    );
}