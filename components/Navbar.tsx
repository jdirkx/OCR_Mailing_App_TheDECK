// components/Navbar.tsx
"use client";
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="px-5 py-3 bg-black shadow-sm font-work-sans text-lg">
      <nav className="flex justify-center items-center">
        {session && (
          <ul className="flex items-center gap-10 text-white font-work-sans">
            <li>
              <Link href="/mail-upload" className="hover:text-blue-300 transition navbar-button">Upload</Link>
            </li>
            <li>
              <Link href="/clients-list" className="hover:text-blue-300 transition navbar-button">Clients</Link>
            </li>
            <li>
              <Link href="/review" className="hover:text-blue-300 transition navbar-button">Review</Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-blue-300 transition navbar-button">Settings</Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
