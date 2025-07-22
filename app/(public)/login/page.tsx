"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/components/Login";

function LoginOrRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("[Login Page] Session:", session, "Status:", status);
    // Only redirect if all user fields are present (prevents redirect loop)
    if (
      status === "authenticated" &&
      session?.userName
    ) {
      console.log("[Login Page] Redirecting to /mail-upload");
      router.replace("/mail-upload");
    }
  }, [status, session, router]);

  return <LoginPage />;
}

export default function Home() {
  return (
    <SessionProvider>
      <LoginOrRedirect />
    </SessionProvider>
  );
}
