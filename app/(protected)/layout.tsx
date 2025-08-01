import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { MailProvider } from "@/components/context";

export default async function MyComponent({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <MailProvider>
        <Navbar />
        {children}
      </MailProvider>
    </SessionProvider>
  );
}