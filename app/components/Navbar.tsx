import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { auth, signOut } from "@/auth";
import { redirect } from 'next/navigation';

const Navbar = async () => {
  const session = await auth();

  return (
    <header className='px-5 py-3 bg-black shadow-sm font-work-sans'>
      <nav className='flex justify-between items-center'>
        {/* <Link href="/">
          <Image src="/logo-1.png" alt="logo" width={144} height={30} />
        </Link> */}

        <div className='flex items-center gap-5 text-white'>
          {session && (
            <>
              {/* Main Sections */}
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
              {/* User Info and Logout */}
              <form
                action={async () => { 
                  "use server";
                  await signOut({ redirect: false });
                  redirect('/');
                }}
              >
                <button type="submit" className='cursor-pointer hover:text-blue-300 transition ml-4 navbar-button'>
                  <span>LOGOUT</span>
                </button>
              </form>
              {/* <Link href={`/user/${session.user?.id}`}>
                <span className="ml-2">{session.user?.name}</span>
              </Link> */}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;