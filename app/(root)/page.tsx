import React from "react";
import LoginPage from "../../components/Login";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <div className="font-work-sans">
        <LoginPage />
      </div>
    </SessionProvider>
  );
}
