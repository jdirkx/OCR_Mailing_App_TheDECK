import React from 'react';
import Link from 'next/link';
import { auth } from "@/auth";
import { signOutAction } from '@/app/lib/auth-actions';

const Navbar = async () => {
  const session = await auth();

  return (
    <header className='px-5 py-3 bg-black shadow-sm font-work-sans'>
      <nav className='flex justify-between items-center'>
        {session && (
          <div className="flex flex-1 items-center">
            <ul className="flex items-center gap-10 text-white font-work-sans">
              <li>
                <Link href="/mail-upload" className="hover:text-blue-300 transition navbar-button">Upload</Link>
              </li>
              <li>
                <Link href="/clients-list" className="hover:text-blue-300 transition navbar-button">Clients</Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-blue-300 transition navbar-button">Settings</Link>
              </li>
            </ul>
            <div className="flex-1" />
            <form action={signOutAction}>
              <button type="submit" className='cursor-pointer hover:text-blue-300 transition navbar-button'>
                LOGOUT
              </button>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
