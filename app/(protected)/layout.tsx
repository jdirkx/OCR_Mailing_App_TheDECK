import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default async function MyComponent({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <Navbar />
      {children}
    </SessionProvider>
  );
}