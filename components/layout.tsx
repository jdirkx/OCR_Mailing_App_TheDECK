"use client";

import { MailProvider } from "./context";

export default function MailLayout({ children }: { children: React.ReactNode }) {
  return <MailProvider>{children}</MailProvider>;
}
